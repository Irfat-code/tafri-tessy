import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/lib/app";
import { useCart } from "@/lib/cart";
import { useLoader } from "@/lib/data";
import { naira, orderCode } from "@/lib/format";
import { colors, serif } from "@/lib/theme";
import { Button, Card, Loading, Row } from "@/components/ui";

type VerifiedOrder = {
  order_no: number;
  status: string;
  total_kobo: number;
  full_name: string;
  email: string;
  city: string;
  state: string;
};

// The app's version of the website's /checkout/success page.
export default function OrderResultScreen() {
  const { reference } = useLocalSearchParams<{ reference?: string }>();
  const { api } = useApp();
  const { clear } = useCart();

  const order = useLoader(async () => {
    if (!reference) return null;
    const res = await api(`/api/orders/verify?reference=${encodeURIComponent(reference)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("We couldn't confirm your payment yet.");
    return (await res.json()) as VerifiedOrder;
  }, [reference, api]);

  const paid = order.data?.status === "paid" || order.data?.status === "delivered";
  useEffect(() => {
    if (paid) clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paid]);

  if (order.loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
        <Loading />
        <Text style={{ textAlign: "center", color: colors.muted, marginBottom: 80 }}>Confirming your payment…</Text>
      </SafeAreaView>
    );
  }

  let body: React.ReactNode;
  if (order.error) {
    body = (
      <>
        <Ionicons name="time-outline" size={56} color={colors.amber} style={{ alignSelf: "center" }} />
        <Text style={title}>Still confirming</Text>
        <Text style={text}>
          {order.error} If you were charged, your order will appear in My Orders shortly.
        </Text>
        <Button title="Try again" onPress={order.reload} />
        <Button title="View my orders" variant="outline" onPress={() => router.replace("/account")} />
      </>
    );
  } else if (!order.data) {
    body = (
      <>
        <Ionicons name="help-circle-outline" size={56} color={colors.muted} style={{ alignSelf: "center" }} />
        <Text style={title}>Order not found</Text>
        <Text style={text}>We couldn&apos;t find that order. If you were charged, please contact us.</Text>
        <Button title="Back to shop" onPress={() => router.replace("/shop")} />
      </>
    );
  } else if (!paid) {
    body = (
      <>
        <Ionicons name="close-circle-outline" size={56} color={colors.danger} style={{ alignSelf: "center" }} />
        <Text style={title}>Payment not completed</Text>
        <Text style={text}>
          Your payment for order #{orderCode(order.data.order_no)} didn&apos;t go through. Nothing was charged.
        </Text>
        <Button title="Back to cart" onPress={() => router.replace("/cart")} />
      </>
    );
  } else {
    const o = order.data;
    body = (
      <>
        <Text style={{ fontSize: 56, textAlign: "center" }}>🌸</Text>
        <Text style={title}>Thank you, {o.full_name.split(" ")[0]}!</Text>
        <Text style={text}>Your payment was successful.</Text>
        <Card style={{ gap: 10 }}>
          <Row label="Order number" value={`#${orderCode(o.order_no)}`} bold />
          <Row label="Total paid" value={naira(o.total_kobo)} />
          <Row label="Delivering to" value={`${o.city}, ${o.state}`} />
        </Card>
        <Text style={text}>A confirmation email is on its way to {o.email}.</Text>
        <Button title="Continue Shopping" onPress={() => router.replace("/shop")} />
        <Button title="View my orders" variant="outline" onPress={() => router.replace("/account")} />
      </>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
        <View style={{ gap: 14 }}>{body}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const title = { fontFamily: serif, fontSize: 28, color: colors.forest, textAlign: "center" as const };
const text = { fontSize: 15, color: colors.muted, textAlign: "center" as const, lineHeight: 22 };
