import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { imageUri, useApp } from "@/lib/app";
import { useCart } from "@/lib/cart";
import { naira } from "@/lib/format";
import { colors, radius, shadow } from "@/lib/theme";
import { Button, Empty, Loading, QuantityStepper, Row } from "@/components/ui";

export default function CartScreen() {
  const { items, subtotal, count, ready, setQuantity, removeItem } = useCart();
  const { config } = useApp();

  if (!ready) return <Loading />;

  if (items.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Empty icon="bag-outline" text="Your cart is empty. Find a wreath you love and it will show up here. 🌸" cta="Browse Wreaths" onPress={() => router.push("/shop")} />
      </View>
    );
  }

  const total = subtotal + config.deliveryKobo;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.productId}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={<Text style={{ color: colors.muted, marginBottom: 2 }}>{count} {count === 1 ? "item" : "items"}</Text>}
        renderItem={({ item: i }) => (
          <View style={styles.item}>
            <Pressable onPress={() => router.push(`/product/${i.productId}`)}>
              <Image source={{ uri: imageUri(i.image_url) }} style={styles.image} contentFit="cover" />
            </Pressable>
            <View style={{ flex: 1, justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                <Text style={{ fontSize: 15, fontWeight: "500", flex: 1, color: colors.ink }} numberOfLines={2}>
                  {i.name}
                </Text>
                <Pressable
                  hitSlop={10}
                  accessibilityLabel={`Remove ${i.name}`}
                  onPress={() =>
                    Alert.alert("Remove from cart?", i.name, [
                      { text: "Cancel", style: "cancel" },
                      { text: "Remove", style: "destructive", onPress: () => removeItem(i.productId) },
                    ])
                  }
                >
                  <Ionicons name="trash-outline" size={20} color="#9ca3af" />
                </Pressable>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <QuantityStepper size="sm" value={i.quantity} max={i.stock} onChange={(n) => setQuantity(i.productId, n)} />
                <Text style={{ fontWeight: "700", color: colors.forest, fontSize: 15 }}>{naira(i.price_kobo * i.quantity)}</Text>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.summary}>
        <Row label="Subtotal" value={naira(subtotal)} />
        <Row label="Delivery" value={naira(config.deliveryKobo)} />
        <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 8 }}>
          <Row label="Total" value={naira(total)} bold />
        </View>
        <Button title="Proceed to Checkout" onPress={() => router.push("/checkout")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: "row", gap: 12, backgroundColor: colors.white, borderRadius: radius.md, padding: 12, ...shadow },
  image: { width: 88, height: 88, borderRadius: radius.sm, backgroundColor: "#f3e8e0" },
  summary: {
    backgroundColor: colors.white,
    padding: 16,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
