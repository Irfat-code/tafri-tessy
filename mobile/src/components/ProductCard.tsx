import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { imageUri } from "@/lib/app";
import { naira } from "@/lib/format";
import type { Product } from "@/lib/data";
import { colors, radius, shadow } from "@/lib/theme";

export default function ProductCard({ product, width }: { product: Product; width?: number }) {
  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${naira(product.price_kobo)}`}
      style={({ pressed }) => [styles.card, width ? { width } : { flex: 1 }, pressed && { opacity: 0.9 }]}
    >
      <Image source={{ uri: imageUri(product.image_url) }} style={styles.image} contentFit="cover" transition={150} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>{naira(product.price_kobo)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.md, overflow: "hidden", ...shadow },
  image: { width: "100%", aspectRatio: 1, backgroundColor: "#f3e8e0" },
  body: { padding: 12, gap: 4 },
  name: { fontSize: 15, fontWeight: "500", color: colors.ink },
  price: { fontSize: 15, fontWeight: "700", color: colors.forest },
});
