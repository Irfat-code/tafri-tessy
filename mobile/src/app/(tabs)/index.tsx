import { FlatList, Image as RNImage, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/lib/app";
import { useCart } from "@/lib/cart";
import { unwrap, useLoader, type Product } from "@/lib/data";
import { PHOTOS, SHOP_OCCASIONS } from "@/lib/constants";
import { colors, radius, serif } from "@/lib/theme";
import ProductCard from "@/components/ProductCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button, Loading } from "@/components/ui";

export default function HomeScreen() {
  const { supabase, user } = useApp();
  const { count } = useCart();
  const featured = useLoader(
    async () =>
      unwrap(
        await supabase
          .from("products")
          .select("id, name, price_kobo, image_url, category")
          .eq("is_available", true)
          .order("created_at", { ascending: true })
          .limit(4)
      ) as Product[],
    [supabase]
  );

  const initial = (user?.user_metadata?.full_name ?? user?.email ?? "")[0]?.toUpperCase();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <RNImage source={require("../../../assets/logo.png")} style={{ width: 44, height: 40 }} resizeMode="contain" />
          <View>
            <Text style={styles.brand}>TafriTessy</Text>
            <Text style={styles.tagline}>
              WREATHS <Text style={{ color: colors.rose }}>•</Text> DESIGNS <Text style={{ color: colors.rose }}>•</Text> MORE
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Pressable onPress={() => router.push("/cart")} hitSlop={8} accessibilityLabel={`Cart, ${count} items`}>
            <Ionicons name="bag-outline" size={24} color={colors.ink} />
            {count > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{count}</Text>
              </View>
            )}
          </Pressable>
          <Pressable onPress={() => router.push("/account")} accessibilityLabel="My account" style={styles.avatar}>
            {initial ? (
              <Text style={{ color: colors.white, fontWeight: "600" }}>{initial}</Text>
            ) : (
              <Ionicons name="person" size={16} color={colors.white} />
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32, gap: 28 }}
        refreshControl={<RefreshControl refreshing={featured.refreshing} onRefresh={featured.refresh} tintColor={colors.rose} colors={[colors.rose]} />}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Image source={PHOTOS.hero} style={styles.heroImage} contentFit="cover" />
          <View style={{ padding: 20, gap: 12 }}>
            <Text style={styles.heroTitle}>Beautiful Wreaths, Made with Love</Text>
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 15 }}>
              Handcrafted floral designs for every occasion, from celebrations to everyday moments.
            </Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              <Button title="Shop Wreaths" onPress={() => router.push("/shop")} style={{ flex: 1, paddingHorizontal: 8 }} />
              <Button title="Book Custom" variant="ghost" onPress={() => router.push("/book")} style={{ flex: 1, paddingHorizontal: 8 }} />
            </View>
          </View>
        </View>

        {/* Shop by occasion */}
        <View style={{ gap: 14 }}>
          <Text style={[styles.section, { paddingHorizontal: 16 }]}>Shop by Occasion</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}>
            {SHOP_OCCASIONS.map((o) => (
              <Pressable
                key={o.key}
                onPress={() =>
                  o.key === "custom" ? router.push("/book") : router.push({ pathname: "/shop", params: { category: o.key } })
                }
                style={{ alignItems: "center", gap: 8, width: 78 }}
                accessibilityRole="button"
                accessibilityLabel={`${o.label} wreaths`}
              >
                <Image source={o.image} style={styles.occasion} contentFit="cover" />
                <Text style={{ fontSize: 13, color: colors.ink }}>{o.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Featured */}
        <View style={{ gap: 14 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.section}>Featured Wreaths</Text>
            <Pressable onPress={() => router.push("/shop")} hitSlop={8}>
              <Text style={{ color: colors.rose, fontSize: 14, fontWeight: "500" }}>View All →</Text>
            </Pressable>
          </View>
          {featured.loading ? (
            <Loading />
          ) : !featured.data?.length ? (
            <Text style={{ color: colors.muted, paddingHorizontal: 16 }}>
              {featured.error ?? "No wreaths yet. Check back soon. 🌸"}
            </Text>
          ) : (
            <FlatList
              horizontal
              data={featured.data}
              keyExtractor={(p) => p.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 14, paddingBottom: 6 }}
              renderItem={({ item }) => <ProductCard product={item} width={170} />}
            />
          )}
        </View>

        {/* Custom CTA */}
        <View style={styles.cta}>
          <Text style={[styles.heroTitle, { textAlign: "center", fontSize: 26 }]}>Need Something Custom?</Text>
          <Text style={{ color: "rgba(255,255,255,0.85)", textAlign: "center", fontSize: 15 }}>
            Tell us what you have in mind and we&apos;ll bring it to life.
          </Text>
          <Button title="Book a Consultation" variant="white" onPress={() => router.push("/book")} />
          <WhatsAppButton />
        </View>

        <Pressable onPress={() => router.push("/about")} style={{ alignItems: "center" }}>
          <Text style={{ color: colors.rose, fontSize: 14 }}>About TafriTessy</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(217,102,122,0.1)",
  },
  brand: { fontFamily: serif, fontSize: 22, color: colors.forest, lineHeight: 26 },
  tagline: { fontSize: 8, letterSpacing: 1.6, color: colors.forest },
  badge: {
    position: "absolute",
    right: -8,
    top: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.rose,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: "600" },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { marginHorizontal: 16, marginTop: 12, borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.forest },
  heroImage: { width: "100%", height: 220 },
  heroTitle: { fontFamily: serif, fontSize: 30, lineHeight: 36, color: colors.white },
  section: { fontFamily: serif, fontSize: 22, color: colors.forest },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 16 },
  occasion: { width: 74, height: 74, borderRadius: 37, backgroundColor: "#f3e8e0" },
  cta: { marginHorizontal: 16, borderRadius: radius.lg, backgroundColor: colors.forest, padding: 24, gap: 12 },
});
