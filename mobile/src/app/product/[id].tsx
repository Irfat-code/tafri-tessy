import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { api, type Product } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { colors } from "@/lib/config";
import { imageUrl, naira } from "@/lib/format";
import { Button, Center, Stepper, text } from "@/components/ui";

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ product: Product }>(`/api/products/${id}`)
      .then((d) => setProduct(d.product))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <Center><Text style={text.body}>{error}</Text></Center>;
  if (!product) return <Center><Text style={text.muted}>Loading…</Text></Center>;

  const soldOut = product.stock <= 0;

  async function addToCart(goToCart: boolean) {
    if (!session) {
      Alert.alert("Sign in first", "Sign in with Google so your cart is saved on the app and the website.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign in", onPress: () => router.push("/account") },
      ]);
      return;
    }
    setBusy(true);
    try {
      await add(product!.id, qty);
      if (goToCart) router.push("/cart");
      else Alert.alert("Added to cart", `${product!.name} × ${qty}`);
    } catch (e) {
      Alert.alert("Could not add", e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
      <Stack.Screen options={{ title: product.name }} />
      <Image source={{ uri: imageUrl(product.image_url) }} style={styles.image} />
      <View style={styles.body}>
        <Text style={text.title}>{product.name}</Text>
        <Text style={[text.price, { fontSize: 22 }]}>{naira(product.price_kobo)}</Text>
        {product.description ? <Text style={text.body}>{product.description}</Text> : null}
        <Text style={text.muted}>
          Availability:{" "}
          <Text style={{ fontWeight: "600", color: soldOut ? "#dc2626" : product.stock <= 2 ? "#d97706" : "#15803d" }}>
            {soldOut ? "Sold out" : product.stock <= 2 ? `Only ${product.stock} left` : "In stock"}
          </Text>
        </Text>

        {soldOut ? (
          <Text style={[text.body, styles.soldOut]}>This wreath is sold out. Book a custom one on the website.</Text>
        ) : (
          <View style={{ gap: 12, marginTop: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Stepper value={qty} max={product.stock} onChange={setQty} />
              <Button title="Add to Cart" onPress={() => addToCart(false)} loading={busy} style={{ flex: 1 }} />
            </View>
            <Button title="Buy Now" variant="forest" onPress={() => addToCart(true)} disabled={busy} />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  image: { width: "100%", aspectRatio: 1 },
  body: { padding: 16, gap: 10 },
  soldOut: { backgroundColor: colors.white, padding: 14, borderRadius: 12, textAlign: "center" },
});
