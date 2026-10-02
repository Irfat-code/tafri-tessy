import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { exchangeCodeFromUrl } from "@/lib/auth";
import { Center } from "@/components/ui";
import { colors } from "@/lib/config";

// Some phones return from Google sign-in by opening this link in the app
// instead of handing it back to the sign-in screen. Finish sign-in here too.
export default function AuthCallback() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  useEffect(() => {
    const url = Linking.createURL("auth-callback", { queryParams: code ? { code } : {} });
    exchangeCodeFromUrl(url).catch(() => {}).finally(() => router.replace("/account"));
  }, [code]);
  return <Center><ActivityIndicator color={colors.rose} /></Center>;
}
