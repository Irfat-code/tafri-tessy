import { useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { SITE_URL } from "@/lib/app";
import { colors } from "@/lib/theme";

// Paystack's payment page inside the app. When Paystack sends the customer
// back to the website's /checkout/success, we stop there and confirm the
// payment natively instead.
export default function PayScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const [loading, setLoading] = useState(true);
  const done = useRef(false);

  function finish(nextUrl: string) {
    if (done.current) return;
    done.current = true;
    const query = nextUrl.split("?")[1] ?? "";
    const params = new URLSearchParams(query);
    const reference = params.get("reference") ?? params.get("trxref") ?? "";
    router.replace({ pathname: "/order-result", params: { reference } });
  }

  function cancel() {
    Alert.alert("Leave payment?", "Your order won't be placed until payment is complete.", [
      { text: "Stay", style: "cancel" },
      { text: "Leave", style: "destructive", onPress: () => router.back() },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable onPress={cancel} hitSlop={10} accessibilityLabel="Cancel payment">
              <Ionicons name="close" size={26} color={colors.forest} />
            </Pressable>
          ),
        }}
      />
      {!!url && (
        <WebView
          source={{ uri: url }}
          onLoadEnd={() => setLoading(false)}
          onShouldStartLoadWithRequest={(req) => {
            if (req.url.startsWith(`${SITE_URL}/checkout/success`)) {
              finish(req.url);
              return false;
            }
            return true;
          }}
          onNavigationStateChange={(nav) => {
            // Android may not ask before a server redirect, so check here too.
            if (nav.url.startsWith(`${SITE_URL}/checkout/success`)) finish(nav.url);
          }}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
        />
      )}
      {loading && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.rose} />
        </View>
      )}
    </View>
  );
}
