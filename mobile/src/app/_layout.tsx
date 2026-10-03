import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider, type AppStatus } from "@/lib/app";
import { CartProvider } from "@/lib/cart";
import { Button } from "@/components/ui";
import { colors, serif } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppProvider fallback={(status) => <Starting status={status} />}>
        <CartProvider>
          <Ready />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.cream },
              headerTintColor: colors.forest,
              headerTitleStyle: { fontFamily: serif, color: colors.forest },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.cream },
              headerBackButtonDisplayMode: "minimal",
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="product/[id]" options={{ title: "" }} />
            <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
            <Stack.Screen name="pay" options={{ title: "Secure Payment", presentation: "fullScreenModal" }} />
            <Stack.Screen name="order-result" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="about" options={{ title: "About TafriTessy" }} />
            <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
          </Stack>
        </CartProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

// Hides the splash screen once the app has loaded its settings.
function Ready() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);
  return null;
}

function Starting({ status }: { status: AppStatus }) {
  useEffect(() => {
    if (status.state === "error") SplashScreen.hideAsync().catch(() => {});
  }, [status.state]);

  if (status.state === "loading") return <View style={styles.screen} />;
  return (
    <View style={styles.screen}>
      <Image source={require("../../assets/logo.png")} style={{ width: 120, height: 105 }} resizeMode="contain" />
      <Text style={styles.title}>Can&apos;t reach TafriTessy</Text>
      <Text style={styles.text}>Check your internet connection and try again.</Text>
      <Button title="Try again" onPress={status.retry} style={{ alignSelf: "stretch" }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream, alignItems: "center", justifyContent: "center", padding: 32, gap: 14 },
  title: { fontFamily: serif, fontSize: 24, color: colors.forest, textAlign: "center" },
  text: { fontSize: 15, color: colors.muted, textAlign: "center" },
});
