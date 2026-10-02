import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { api, type Product } from "@/lib/api";
import { colors } from "@/lib/config";
import { imageUrl, naira } from "@/lib/format";
import { Center, text } from "@/components/ui";

const CATEGORIES = [
  { key: "", label: "All" },
  { key: "wedding", label: "Wedding" },
  { key: "birthday", label: "Birthday" },
  { key: "home", label: "Home Decor" },
  { key: "funeral", label: "Funeral" },
  { key: "seasonal", label: "Seasonal" },
];

export default function ShopScreen() {
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      const q = category ? `?category=${category}` : "";
      const data = await api<{ products: Product[] }>(`/api/products${q}`);
      setProducts(data.products);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load wreaths.");
    }
  }, [category]);

  useEffect(() => { setProducts(null); load(); }, [load]);

  const header = (
    <View>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Beautiful Wreaths, Made with Love</Text>
        <Text style={styles.heroText}>Handcrafted floral designs for every occasion.</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {CATEGORIES.map((c) => (
          <Pressable key={c.key} onPress={() => setCategory(c.key)}
            style={[styles.chip, category === c.key && styles.chipActive]}>
            <Text style={[styles.chipText, category === c.key && { color: colors.white }]}>{c.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  if (error && !products) {
    return <Center><Text style={text.body}>{error}</Text><Text style={text.muted} onPress={load}>Tap to try again</Text></Center>;
  }

  return (
    <FlatList
      data={products ?? []}
      keyExtractor={(p) => p.id}
      numColumns={2}
      ListHeaderComponent={header}
      ListEmptyComponent={<Text style={[text.muted, { textAlign: "center", marginTop: 40 }]}>
        {products ? "No wreaths in this category yet." : "Loading wreaths…"}
      </Text>}
      columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
      contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
      refreshControl={<RefreshControl refreshing={refreshing}
        onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => router.push(`/product/${item.id}`)}>
          <Image source={{ uri: imageUrl(item.image_url) }} style={styles.image} />
          <View style={{ padding: 10, gap: 4 }}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={text.price}>{naira(item.price_kobo)}</Text>
            {item.stock <= 0 && <Text style={{ color: "#dc2626", fontSize: 12 }}>Sold out</Text>}
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  hero: { margin: 16, padding: 20, borderRadius: 18, backgroundColor: colors.forest, gap: 6 },
  heroTitle: { fontFamily: "serif", fontSize: 24, color: colors.white },
  heroText: { color: "rgba(255,255,255,0.85)" },
  chips: { gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  chip: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  chipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipText: { color: colors.ink, fontSize: 14 },
  card: { flex: 1, backgroundColor: colors.white, borderRadius: 14, overflow: "hidden" },
  image: { width: "100%", aspectRatio: 1 },
  name: { fontSize: 14, fontWeight: "500", color: colors.ink },
});
