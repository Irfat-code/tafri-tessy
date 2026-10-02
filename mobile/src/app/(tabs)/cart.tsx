import { useCallback } from "react";
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { colors, DELIVERY_KOBO } from "@/lib/config";
import { imageUrl, naira } from "@/lib/format";
import { Button, Center, Stepper, text } from "@/components/ui";

export default function CartScreen() {
  const { session } = useAuth();
  const { items, subtotal, loading, refresh, setQuantity, remove } = useCart();

  // Also refresh whenever this tab is opened (Realtime keeps it live while open).
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  if (!session) {
    return (
      <Center>
        <Text style={text.heading}>Sign in to see your cart</Text>
        <Text style={[text.muted, { textAlign: "center" }]}>Your cart is shared with the TafriTessy website when you sign in.</Text>
        <Button title="Sign in" onPress={() => router.push("/account")} />
      </Center>
    );
  }

  if (items.length === 0) {
    return (
      <Center>
        <Text style={text.heading}>{loading ? "Loading your cart…" : "Your cart is empty"}</Text>
        {!loading && <Button title="Browse Wreaths" onPress={() => router.push("/")} />}
      </Center>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.productId}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Image source={{ uri: imageUrl(item.image_url) }} style={styles.image} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Pressable onPress={() => remove(item.productId)} hitSlop={10}><Text>🗑</Text></Pressable>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Stepper value={item.quantity} max={item.stock} onChange={(n) => setQuantity(item.productId, n)} />
              <Text style={text.price}>{naira(item.price_kobo * item.quantity)}</Text>
            </View>
          </View>
        </View>
      )}
      ListFooterComponent={
        <View style={styles.summary}>
          <Line label="Subtotal" value={naira(subtotal)} />
          <Line label="Delivery" value={naira(DELIVERY_KOBO)} />
          <View style={styles.divider} />
          <Line label="Total" value={naira(subtotal + DELIVERY_KOBO)} bold />
          <Button title="Proceed to Checkout" onPress={() => router.push("/checkout")} style={{ marginTop: 8 }} />
        </View>
      }
    />
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={[text.body, bold && { fontWeight: "700", fontSize: 17 }]}>{label}</Text>
      <Text style={[text.body, bold && { fontWeight: "700", fontSize: 17 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, backgroundColor: colors.white, borderRadius: 14, padding: 12 },
  image: { width: 80, height: 80, borderRadius: 10 },
  name: { flex: 1, fontSize: 15, fontWeight: "500" },
  summary: { backgroundColor: colors.white, borderRadius: 14, padding: 16, gap: 8, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 4 },
});
