import { useEffect } from "react";
import { Alert } from "react-native";
import { router, useGlobalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { useApp } from "@/lib/app";
import { Loading } from "@/components/ui";

// Google sign-in returns to tafritessy://auth/callback?code=...
// Usually the sign-in browser hands the code back directly; this screen
// covers the case where Android opens the app from the link instead.
export default function AuthCallback() {
  const { completeSignIn } = useApp();
  const params = useGlobalSearchParams<{ code?: string; error_description?: string }>();

  useEffect(() => {
    const query = new URLSearchParams();
    if (params.code) query.set("code", params.code);
    if (params.error_description) query.set("error_description", params.error_description);
    completeSignIn(`${Linking.createURL("auth/callback")}?${query.toString()}`)
      .catch((err) => Alert.alert("Sign-in failed", err instanceof Error ? err.message : "Please try again."))
      .finally(() => router.replace("/account"));
  }, [params.code, params.error_description, completeSignIn]);

  return <Loading />;
}
