import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { imageUri, useApp } from "@/lib/app";
import { useCart } from "@/lib/cart";
import { naira } from "@/lib/format";
import { NIGERIAN_STATES } from "@/lib/constants";
import { colors } from "@/lib/theme";
import { Button, Card, Empty, ErrorBox, Field, Input, Row, SelectField, Title } from "@/components/ui";

export default function CheckoutScreen() {
  const { items, subtotal } = useCart();
  const { user, config, api } = useApp();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", address: "", city: "", state: "Lagos" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fill in name and email for signed-in customers, like the website.
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      full_name: f.full_name || user.user_metadata?.full_name || "",
      email: f.email || user.email || "",
    }));
  }, [user]);

  const set = (field: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [field]: value }));

  async function placeOrder() {
    setError("");
    if (Object.values(form).some((v) => !v.trim())) return setError("Please fill in all delivery details.");
    setLoading(true);
    try {
      // The same endpoint the website uses. The server re-prices everything.
      const res = await api("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error ?? "Something went wrong. Please try again.");
      router.push({ pathname: "/pay", params: { url: data.url } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Empty icon="bag-outline" text="Your cart is empty." cta="Browse Wreaths" onPress={() => router.replace("/shop")} />
      </View>
    );
  }

  const total = subtotal + config.deliveryKobo;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Card style={{ gap: 14 }}>
          <Title style={{ fontSize: 20 }}>Delivery Details</Title>
          <Field label="Full name">
            <Input value={form.full_name} onChangeText={set("full_name")} autoComplete="name" textContentType="name" />
          </Field>
          <Field label="Email">
            <Input value={form.email} onChangeText={set("email")} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" placeholder="0801 234 5678" autoComplete="tel" />
          </Field>
          <Field label="Delivery address">
            <Input value={form.address} onChangeText={set("address")} autoComplete="street-address" />
          </Field>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Field label="City">
                <Input value={form.city} onChangeText={set("city")} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="State">
                <SelectField title="Choose your state" value={form.state} options={NIGERIAN_STATES} placeholder="State" onChange={set("state")} />
              </Field>
            </View>
          </View>
          <Text style={{ fontSize: 12, color: colors.muted }}>Your order confirmation will be sent to this email.</Text>
        </Card>

        <Card style={{ gap: 10 }}>
          <Title style={{ fontSize: 20 }}>Order Summary</Title>
          {items.map((i) => (
            <View key={i.productId} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Image source={{ uri: imageUri(i.image_url) }} style={{ width: 44, height: 44, borderRadius: 6 }} />
              <Text style={{ flex: 1, fontSize: 14, color: colors.ink }}>
                {i.name} × {i.quantity}
              </Text>
              <Text style={{ fontSize: 14, color: colors.ink }}>{naira(i.price_kobo * i.quantity)}</Text>
            </View>
          ))}
          <View style={styles.rule} />
          <Row label="Subtotal" value={naira(subtotal)} />
          <Row label="Delivery" value={naira(config.deliveryKobo)} />
          <View style={styles.rule} />
          <Row label="Total" value={naira(total)} bold />
        </Card>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.bar}>
        {!!error && <ErrorBox message={error} />}
        <Button title={loading ? "Taking you to payment…" : `Pay ${naira(total)}`} loading={loading} onPress={placeOrder} />
        <Text style={{ textAlign: "center", fontSize: 12, color: colors.muted }}>🔒 Secure payment by Paystack</Text>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 2 },
  bar: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
