import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { imageUri, useApp } from "@/lib/app";
import { useCart } from "@/lib/cart";
import { unwrap, useLoader, type ProductDetail } from "@/lib/data";
import { naira } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/constants";
import { colors, radius, serif } from "@/lib/theme";
import { Button, Empty, Loading, QuantityStepper } from "@/components/ui";

const INFO = [
  { title: "Details", text: "Each wreath is handcrafted, so small variations make every piece unique." },
  { title: "Care Instructions", text: "Keep away from direct rain and strong sun. Dust gently with a soft brush." },
  {
    title: "Shipping & Returns",
    text: "We confirm delivery details by email after your order. Contact us within 48 hours of delivery if there is an issue.",
  },
];

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { supabase, user } = useApp();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const product = useLoader(
    async () => unwrap(await supabase.from("products").select("*").eq("id", id).maybeSingle()) as ProductDetail | null,
    [supabase, id]
  );
  const saved = useSaved(id, user?.id ?? null);

  if (product.loading) return <Loading />;
  const p = product.data;
  if (!p) {
    return (
      <View style={{ padding: 16 }}>
        <Empty icon="sad-outline" text={product.error ?? "We couldn't find that wreath."} cta="Back to shop" onPress={() => router.replace("/shop")} />
      </View>
    );
  }

  const soldOut = p.stock <= 0 || !p.is_available;
  const item = { productId: p.id, name: p.name, price_kobo: p.price_kobo, image_url: p.image_url, stock: p.stock };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={saved.toggle} disabled={saved.busy} hitSlop={10} accessibilityLabel={saved.saved ? "Remove from saved" : "Save for later"}>
              <Ionicons name={saved.saved ? "heart" : "heart-outline"} size={26} color={saved.saved ? colors.rose : colors.ink} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Image source={{ uri: imageUri(p.image_url) }} style={styles.image} contentFit="cover" transition={200} />
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ color: colors.rose, fontSize: 14 }}>{CATEGORY_LABELS[p.category] ?? p.category} Collection</Text>
          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.price}>{naira(p.price_kobo)}</Text>
          {!!p.description && <Text style={{ color: "#374151", fontSize: 15, lineHeight: 22 }}>{p.description}</Text>}
          <Text style={{ fontSize: 14, color: colors.ink }}>
            Availability:{" "}
            {soldOut ? (
              <Text style={{ color: colors.danger, fontWeight: "600" }}>Sold out</Text>
            ) : p.stock <= 2 ? (
              <Text style={{ color: colors.amber, fontWeight: "600" }}>Only {p.stock} left</Text>
            ) : (
              <Text style={{ color: colors.success, fontWeight: "600" }}>In stock</Text>
            )}
          </Text>

          <View style={styles.features}>
            {[
              ["leaf-outline", "Handmade with care"],
              ["sparkles-outline", "Long lasting"],
              ["car-outline", "Delivery across Nigeria"],
            ].map(([icon, text]) => (
              <View key={text} style={styles.feature}>
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.forest} />
                <Text style={{ fontSize: 12, color: colors.muted, textAlign: "center" }}>{text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.accordion}>
            {INFO.map((s, i) => (
              <View key={s.title} style={i > 0 && styles.divider}>
                <Pressable onPress={() => setOpen(open === s.title ? null : s.title)} style={styles.accordionHead} accessibilityRole="button">
                  <Text style={{ fontWeight: "600", fontSize: 15, color: colors.ink }}>{s.title}</Text>
                  <Ionicons name={open === s.title ? "chevron-up" : "chevron-down"} size={18} color={colors.muted} />
                </Pressable>
                {open === s.title && <Text style={{ color: colors.muted, paddingHorizontal: 16, paddingBottom: 14, lineHeight: 20 }}>{s.text}</Text>}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky buy bar, like a shopping app */}
      <SafeAreaView edges={["bottom"]} style={styles.bar}>
        {soldOut ? (
          <View style={{ gap: 10 }}>
            <Text style={{ textAlign: "center", color: colors.muted }}>Sold out. Want something similar?</Text>
            <Button title="Book a custom wreath" onPress={() => router.push("/book")} />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {added && (
              <Pressable onPress={() => router.push("/cart")} style={styles.toast}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={{ color: colors.success, fontSize: 14 }}>Added to your cart. View cart</Text>
              </Pressable>
            )}
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              <QuantityStepper value={qty} max={p.stock} onChange={setQty} />
              <Button
                title="Add to Cart"
                style={{ flex: 1 }}
                onPress={() => {
                  addItem(item, qty);
                  setAdded(true);
                }}
              />
            </View>
            <Button
              title="Buy Now"
              variant="forest"
              onPress={() => {
                addItem(item, qty);
                router.push("/checkout");
              }}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

// The heart button: adds or removes the wreath from the customer's favorites.
function useSaved(productId: string, userId: string | null) {
  const { supabase } = useApp();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userId) return setSaved(false);
    supabase
      .from("favorites")
      .select("product_id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [supabase, userId, productId]);

  async function toggle() {
    if (!userId) {
      Alert.alert("Sign in to save", "Sign in to keep wreaths in your Saved list.", [
        { text: "Not now", style: "cancel" },
        { text: "Sign in", onPress: () => router.push("/account") },
      ]);
      return;
    }
    setBusy(true);
    const { error } = saved
      ? await supabase.from("favorites").delete().eq("user_id", userId).eq("product_id", productId)
      : await supabase.from("favorites").insert({ user_id: userId, product_id: productId });
    setBusy(false);
    if (error) return Alert.alert("Could not update your saved items. Please try again.");
    setSaved(!saved);
  }

  return { saved, busy, toggle };
}

const styles = StyleSheet.create({
  image: { width: "100%", aspectRatio: 1, backgroundColor: "#f3e8e0" },
  name: { fontFamily: serif, fontSize: 28, color: colors.forest, lineHeight: 34 },
  price: { fontSize: 22, fontWeight: "700", color: colors.ink },
  features: { flexDirection: "row", gap: 10, marginTop: 4 },
  feature: { flex: 1, backgroundColor: colors.white, borderRadius: radius.sm, padding: 10, alignItems: "center", gap: 6 },
  accordion: { backgroundColor: colors.white, borderRadius: radius.sm, marginTop: 4 },
  accordionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  bar: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  toast: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
});
