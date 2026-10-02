import { useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { colors, DELIVERY_KOBO } from "@/lib/config";
import { naira } from "@/lib/format";
import { NIGERIAN_STATES } from "@/lib/nigeria";
import { Button, Center, text } from "@/components/ui";

export default function CheckoutScreen() {
  const { session } = useAuth();
  const { items, subtotal, refresh } = useCart();
  const user = session?.user;
  const [form, setForm] = useState({
    full_name: (user?.user_metadata?.full_name as string) ?? "",
    email: user?.email ?? "",
    phone: "",
    address: "",
    city: "",
    state: "Lagos",
  });
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (items.length === 0) {
    return <Center><Text style={text.heading}>Your cart is empty</Text></Center>;
  }

  const total = subtotal + DELIVERY_KOBO;

  async function pay() {
    if (Object.values(form).some((v) => !v.trim())) {
      Alert.alert("Missing details", "Please fill in all delivery details.");
      return;
    }
    setBusy(true);
    try {
      // Same endpoint as the website: prices are checked on the server.
      const { url } = await api<{ url: string }>("/api/checkout", {
        method: "POST",
        body: { ...form, items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) },
      });
      // Paystack opens in the browser. After paying, Paystack shows the website's
      // thank-you page, the paid wreaths leave the cart and the app updates by itself.
      await WebBrowser.openBrowserAsync(url);
      await refresh();
      router.replace("/account");
    } catch (e) {
      Alert.alert("Checkout failed", e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={text.heading}>Delivery Details</Text>
          <Field label="Full name" value={form.full_name} onChangeText={set("full_name")} />
          <Field label="Email" value={form.email} onChangeText={set("email")} keyboardType="email-address" autoCapitalize="none" />
          <Field label="Phone" value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" placeholder="0801 234 5678" />
          <Field label="Delivery address" value={form.address} onChangeText={set("address")} />
          <Field label="City" value={form.city} onChangeText={set("city")} />
          <Text style={styles.label}>State</Text>
          <Pressable style={styles.input} onPress={() => setPicking(true)}>
            <Text>{form.state} ▾</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={text.heading}>Order Summary</Text>
          {items.map((i) => (
            <View key={i.productId} style={styles.line}>
              <Text style={[text.body, { flex: 1 }]}>{i.name} × {i.quantity}</Text>
              <Text style={text.body}>{naira(i.price_kobo * i.quantity)}</Text>
            </View>
          ))}
          <View style={styles.line}><Text style={text.body}>Delivery</Text><Text style={text.body}>{naira(DELIVERY_KOBO)}</Text></View>
          <View style={styles.line}>
            <Text style={[text.body, { fontWeight: "700" }]}>Total</Text>
            <Text style={[text.body, { fontWeight: "700" }]}>{naira(total)}</Text>
          </View>
          <Button title={`Pay ${naira(total)}`} onPress={pay} loading={busy} style={{ marginTop: 8 }} />
          <Text style={[text.muted, { textAlign: "center" }]}>🔒 Secure payment by Paystack</Text>
        </View>
      </ScrollView>

      <Modal visible={picking} animationType="slide" onRequestClose={() => setPicking(false)}>
        <FlatList
          data={NIGERIAN_STATES}
          keyExtractor={(s) => s}
          contentContainerStyle={{ paddingTop: 48 }}
          renderItem={({ item }) => (
            <Pressable style={styles.stateRow} onPress={() => { set("state")(item); setPicking(false); }}>
              <Text style={[text.body, item === form.state && { color: colors.rose, fontWeight: "700" }]}>{item}</Text>
            </Pressable>
          )}
        />
      </Modal>
    </KeyboardAvoidingView>
  );
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={colors.grey} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 14, padding: 16, gap: 10 },
  label: { fontSize: 13, color: colors.grey },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: colors.ink },
  line: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  stateRow: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.line },
});
