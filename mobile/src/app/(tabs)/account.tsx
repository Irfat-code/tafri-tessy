import { useCallback, useState } from "react";
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { api, type Order } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { API_URL, colors } from "@/lib/config";
import { naira, orderCode } from "@/lib/format";
import { Button, text } from "@/components/ui";

export default function AccountScreen() {
  const { session, loading, signInWithGoogle, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [busy, setBusy] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!session) return setOrders([]);
    try {
      const data = await api<{ orders: Order[] }>("/api/orders");
      setOrders(data.orders);
    } catch {}
  }, [session]);

  useFocusEffect(useCallback(() => { loadOrders(); }, [loadOrders]));

  async function signIn() {
    setBusy(true);
    try { await signInWithGoogle(); }
    catch (e) { Alert.alert("Sign-in failed", e instanceof Error ? e.message : "Please try again."); }
    finally { setBusy(false); }
  }

  if (!session) {
    return (
      <View style={styles.signIn}>
        <Image source={require("../../../assets/logo.png")} style={{ width: 120, height: 110 }} resizeMode="contain" />
        <Text style={text.title}>Welcome to TafriTessy</Text>
        <Text style={[text.muted, { textAlign: "center" }]}>
          Sign in with the same Google account you use on the website. Your cart stays in sync on both.
        </Text>
        <Button title="Continue with Google" onPress={signIn} loading={busy || loading} style={{ alignSelf: "stretch" }} />
      </View>
    );
  }

  const name = (session.user.user_metadata?.full_name as string) ?? "friend";

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={loadOrders} />}>
      <View style={styles.card}>
        <Text style={text.heading}>Hello, {name.split(" ")[0]}!</Text>
        <Text style={text.muted}>{session.user.email}</Text>
      </View>

      <Text style={[text.heading, { marginTop: 8 }]}>My Orders</Text>
      {orders.length === 0 ? (
        <View style={styles.card}><Text style={text.muted}>No orders yet. Paid orders appear here.</Text></View>
      ) : orders.map((o) => (
        <View key={o.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={{ fontWeight: "600" }}>Order #{orderCode(o.order_no)}</Text>
            <Text style={[styles.badge, o.status === "delivered" ? styles.delivered : styles.paid]}>
              {o.status === "delivered" ? "Delivered" : "Paid · Preparing"}
            </Text>
          </View>
          <Text style={text.muted}>{new Date(o.created_at).toLocaleDateString("en-NG")} · {o.city}, {o.state}</Text>
          {o.order_items.map((i, idx) => (
            <Text key={idx} style={text.body}>{i.products?.name ?? "Wreath"} × {i.quantity}</Text>
          ))}
          <Text style={[text.price, { textAlign: "right" }]}>Total {naira(o.total_kobo)}</Text>
        </View>
      ))}

      <Button title="Book a Custom Wreath" variant="forest" style={{ marginTop: 8 }}
        onPress={() => WebBrowser.openBrowserAsync(`${API_URL}/book`)} />
      <Button title="Log out" variant="outline" onPress={signOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  signIn: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 14, backgroundColor: colors.cream },
  card: { backgroundColor: colors.white, borderRadius: 14, padding: 16, gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badge: { fontSize: 12, fontWeight: "600", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: "hidden" },
  paid: { backgroundColor: "#fef3c7", color: "#92400e" },
  delivered: { backgroundColor: "#dcfce7", color: "#166534" },
});
