import { useEffect, useState } from "react";
import { FlatList, RefreshControl, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useApp } from "@/lib/app";
import { unwrap, useLoader, type Product } from "@/lib/data";
import { CATEGORIES } from "@/lib/constants";
import { colors } from "@/lib/theme";
import ProductCard from "@/components/ProductCard";
import { Chip, Empty, ErrorBox, Loading } from "@/components/ui";

export default function ShopScreen() {
  const { supabase } = useApp();
  const params = useLocalSearchParams<{ category?: string }>();
  const [active, setActive] = useState("all");

  // "Shop by Occasion" on Home opens this tab with ?category=...
  useEffect(() => {
    if (params.category && CATEGORIES.some((c) => c.key === params.category)) setActive(params.category);
  }, [params.category]);

  const products = useLoader(async () => {
    let query = supabase
      .from("products")
      .select("id, name, price_kobo, image_url, category")
      .eq("is_available", true)
      .order("created_at", { ascending: true });
    if (active !== "all") query = query.eq("category", active);
    return unwrap(await query) as Product[];
  }, [supabase, active]);

  const header = (
    <View style={{ gap: 14, paddingBottom: 14 }}>
      <Text style={{ color: colors.muted, fontSize: 14, paddingHorizontal: 16 }}>
        Browse our collection of handcrafted wreaths for every occasion.
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
        {CATEGORIES.map((c) => (
          <Chip key={c.key} label={c.label} active={active === c.key} onPress={() => setActive(c.key)} />
        ))}
      </ScrollView>
      {products.error && (
        <View style={{ paddingHorizontal: 16 }}>
          <ErrorBox message={products.error} />
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={products.loading ? [] : products.data ?? []}
      keyExtractor={(p) => p.id}
      numColumns={2}
      ListHeaderComponent={header}
      columnWrapperStyle={{ gap: 14, paddingHorizontal: 16 }}
      contentContainerStyle={{ gap: 14, paddingTop: 8, paddingBottom: 24 }}
      renderItem={({ item, index }) => (
        <>
          <ProductCard product={item} />
          {/* Keep a lone last card half-width. */}
          {index === (products.data?.length ?? 0) - 1 && index % 2 === 0 && <View style={{ flex: 1 }} />}
        </>
      )}
      ListEmptyComponent={
        products.loading ? (
          <Loading />
        ) : products.error ? null : (
          <View style={{ paddingHorizontal: 16 }}>
            <Empty text="No wreaths in this category yet." cta="Book a custom one" onPress={() => router.push("/book")} />
          </View>
        )
      }
      refreshControl={
        <RefreshControl refreshing={products.refreshing} onRefresh={products.refresh} tintColor={colors.rose} colors={[colors.rose]} />
      }
    />
  );
}
