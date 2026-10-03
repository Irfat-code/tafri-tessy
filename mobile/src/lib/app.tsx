import "react-native-url-polyfill/auto";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { createClient, type Session, type SupabaseClient, type User } from "@supabase/supabase-js";
import { DEFAULT_DELIVERY_KOBO } from "@/lib/constants";

WebBrowser.maybeCompleteAuthSession();

// The website the app talks to. Its API routes and the Supabase project are the
// same ones the website uses.
export const SITE_URL = (
  process.env.EXPO_PUBLIC_SITE_URL ||
  (Constants.expoConfig?.extra?.siteUrl as string | undefined) ||
  "https://tafritessy.vercel.app"
).replace(/\/$/, "");

// Where Google sign-in returns to: tafritessy://auth/callback
// Add this URL in Supabase → Authentication → URL Configuration → Redirect URLs.
export const AUTH_REDIRECT = Linking.createURL("auth/callback");

export type AppConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  whatsappNumber: string;
  deliveryKobo: number;
};

export type Profile = {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_admin: boolean;
};

const CONFIG_KEY = "tafritessy-config";

// Public settings come from the website (/api/mobile/config) so the app
// needs no keys of its own. Build-time EXPO_PUBLIC_* values are a fallback.
async function loadConfig(): Promise<AppConfig> {
  const fallback: AppConfig = {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
    whatsappNumber: process.env.EXPO_PUBLIC_WHATSAPP_NUMBER ?? "",
    deliveryKobo: DEFAULT_DELIVERY_KOBO,
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${SITE_URL}/api/mobile/config`, { signal: controller.signal });
    if (!res.ok) throw new Error(`Config request failed (${res.status})`);
    const remote = (await res.json()) as Partial<AppConfig>;
    const config: AppConfig = {
      supabaseUrl: remote.supabaseUrl || fallback.supabaseUrl,
      supabaseAnonKey: remote.supabaseAnonKey || fallback.supabaseAnonKey,
      whatsappNumber: remote.whatsappNumber || fallback.whatsappNumber,
      deliveryKobo: remote.deliveryKobo ?? fallback.deliveryKobo,
    };
    if (config.supabaseUrl && config.supabaseAnonKey) {
      await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config)).catch(() => {});
    }
    return config;
  } catch {
    // Offline or the site is down: use the last good config, then the build-time one.
    const saved = await AsyncStorage.getItem(CONFIG_KEY).catch(() => null);
    if (saved) return JSON.parse(saved) as AppConfig;
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

type AppContextValue = {
  config: AppConfig;
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signInWithGoogle: () => Promise<void>;
  completeSignIn: (url: string) => Promise<void>;
  signOut: () => Promise<void>;
  // fetch() against the website's API, signed in as the current customer.
  api: (path: string, init?: RequestInit) => Promise<Response>;
};

const AppContext = createContext<AppContextValue | null>(null);

export type AppStatus = { state: "loading" } | { state: "error"; retry: () => void };

export function AppProvider({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: (status: AppStatus) => React.ReactNode;
}) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    loadConfig().then((c) => {
      if (!alive) return;
      if (c.supabaseUrl && c.supabaseAnonKey) setConfig(c);
      else setFailed(true);
    });
    return () => {
      alive = false;
    };
  }, [attempt]);

  if (!config) {
    return <>{fallback(failed ? { state: "error", retry: () => setAttempt((n) => n + 1) } : { state: "loading" })}</>;
  }
  return <SignedInProvider config={config}>{children}</SignedInProvider>;
}

function SignedInProvider({ config, children }: { config: AppConfig; children: React.ReactNode }) {
  const supabase = useMemo(
    () =>
      createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          flowType: "pkce",
        },
      }),
    [config.supabaseUrl, config.supabaseAnonKey]
  );
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const handledCodes = useRef(new Set<string>());

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    // Only refresh tokens while the app is in the foreground.
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    supabase.auth.startAutoRefresh();
    return () => {
      sub.subscription.unsubscribe();
      appState.remove();
    };
  }, [supabase]);

  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (!userId) return setProfile(null);
    supabase
      .from("profiles")
      .select("full_name, email, avatar_url, is_admin")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => setProfile((data as Profile | null) ?? null));
  }, [supabase, userId]);

  // Both the sign-in browser result and the deep link route can deliver the
  // same ?code=, so only exchange each code once.
  const completeSignIn = useCallback(
    async (url: string) => {
      const { queryParams } = Linking.parse(url);
      const code = typeof queryParams?.code === "string" ? queryParams.code : null;
      const errorText = queryParams?.error_description ?? queryParams?.error;
      if (errorText) throw new Error(String(errorText));
      if (!code || handledCodes.current.has(code)) return;
      handledCodes.current.add(code);
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
    },
    [supabase]
  );

  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: AUTH_REDIRECT, skipBrowserRedirect: true },
    });
    if (error || !data.url) throw error ?? new Error("Could not start Google sign-in.");
    const result = await WebBrowser.openAuthSessionAsync(data.url, AUTH_REDIRECT);
    if (result.type === "success") await completeSignIn(result.url);
  }, [supabase, completeSignIn]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const accessToken = session?.access_token;
  const api = useCallback(
    (path: string, init: RequestInit = {}) => {
      const headers = new Headers(init.headers);
      if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
      return fetch(`${SITE_URL}${path}`, { ...init, headers });
    },
    [accessToken]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      config,
      supabase,
      session,
      user: session?.user ?? null,
      profile,
      signInWithGoogle,
      completeSignIn,
      signOut,
      api,
    }),
    [config, supabase, session, profile, signInWithGoogle, completeSignIn, signOut, api]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

// Product photos are stored as full Supabase URLs or as paths on the website
// (e.g. /wreaths/rose.jpg).
export function imageUri(url: string | null | undefined) {
  if (!url) return "https://placehold.co/600x600/png";
  if (/^https?:\/\//.test(url)) return url;
  return SITE_URL + (url.startsWith("/") ? url : `/${url}`);
}

// Same link as the website's WhatsApp button.
export function whatsappLink(number: string, message = "Hi TafriTessy! I'd like to book a consultation for a custom wreath.") {
  const raw = number.replace(/\D/g, "");
  if (!raw) return null;
  const intl = raw.startsWith("0") ? "234" + raw.slice(1) : raw;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}
