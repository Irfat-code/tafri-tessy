import { useState } from "react";
import { Alert, Image as RNImage, Pressable, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { imageUri, SITE_URL, useApp } from "@/lib/app";
import { unwrap, useLoader, type BookingRow, type OrderRow, type SavedProduct } from "@/lib/data";
import { naira, orderCode, shortDate } from "@/lib/format";
import { colors, radius, serif, shadow } from "@/lib/theme";
import { Button, Card, Empty, Loading } from "@/components/ui";

const TABS = [
  { key: "orders", label: "Orders" },
  { key: "bookings", label: "Bookings" },
  { key: "saved", label: "Saved" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const ORDER_STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  paid: { label: "Paid · Preparing", bg: "#fef3c7", fg: "#92400e" },
  delivered: { label: "Delivered", bg: "#dcfce7", fg: "#166534" },
};
const BOOKING_STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  pending: { label: "Awaiting quote", bg: "#fef3c7", fg: "#92400e" },
  confirmed: { label: "Confirmed", bg: "#dbeafe", fg: "#1e40af" },
  completed: { label: "Completed", bg: "#dcfce7", fg: "#166534" },
  cancelled: { label: "Cancelled", bg: "#f3f4f6", fg: "#4b5563" },
};

export default function AccountScreen() {
  const { user } = useApp();
  return user ? <SignedIn /> : <SignedOut />;
}

function SignedOut() {
  const { signInWithGoogle } = useApp();
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      Alert.alert("Sign-in failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Card style={{ alignItems: "center", gap: 12, paddingVertical: 28 }}>
        <RNImage source={require("../../../assets/logo.png")} style={{ width: 90, height: 80 }} resizeMode="contain" />
        <Text style={{ fontFamily: serif, fontSize: 26, color: colors.forest }}>Welcome!</Text>
        <Text style={{ color: colors.muted, textAlign: "center" }}>
          Sign in to see your orders and bookings, and to save wreaths for later.
        </Text>
        <Button title="Continue with Google" variant="outline" icon="logo-google" loading={busy} onPress={signIn} style={{ alignSelf: "stretch" }} />
        <Text style={{ fontSize: 12, color: colors.muted, textAlign: "center" }}>You can also shop and check out without an account.</Text>
      </Card>
      <InfoLinks />
    </ScrollView>
  );
}

function SignedIn() {
  const { supabase, user, profile, signOut } = useApp();
  const [tab, setTab] = useState<Tab>("orders");
  const { width } = useWindowDimensions();
  const savedWidth = (width - 32 - 12) / 2;
  const userId = user!.id;

  // The same queries as the website's account page; Row Level Security limits them to this customer.
  const data = useLoader(async () => {
    const [ordersRes, bookingsRes, savedRes] = await Promise.all([
      supabase
        .from("orders")
        .select("id, order_no, status, total_kobo, created_at, city, state, order_items(quantity, unit_price_kobo, products(name, image_url))")
        .eq("user_id", userId)
        .in("status", ["paid", "delivered"])
        .order("created_at", { ascending: false }),
      supabase
        .from("bookings")
        .select("id, occasion, wreath_type, preferred_date, budget, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase.from("favorites").select("products(id, name, price_kobo, image_url, stock)").eq("user_id", userId),
    ]);
    const saved = (unwrap(savedRes) as unknown as { products: SavedProduct | null }[]).flatMap((s) => (s.products ? [s.products] : []));
    return {
      orders: unwrap(ordersRes) as unknown as OrderRow[],
      bookings: unwrap(bookingsRes) as BookingRow[],
      saved,
    };
  }, [supabase, userId]);

  const name = profile?.full_name ?? user?.user_metadata?.full_name ?? "friend";
  const avatar = profile?.avatar_url ?? user?.user_metadata?.avatar_url;

  async function unsave(productId: string) {
    const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("product_id", productId);
    if (error) return Alert.alert("Could not update your saved items. Please try again.");
    data.refresh();
  }

  function confirmSignOut() {
    Alert.alert("Log out?", undefined, [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => signOut() },
    ]);
  }

  const counts: Record<Tab, number> = {
    orders: data.data?.orders.length ?? 0,
    bookings: data.data?.bookings.length ?? 0,
    saved: data.data?.saved.length ?? 0,
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={data.refreshing} onRefresh={data.refresh} tintColor={colors.rose} colors={[colors.rose]} />}
    >
      <Card style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" }]}>
            <Text style={{ color: colors.white, fontSize: 22 }}>{name[0]?.toUpperCase()}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: serif, fontSize: 22, color: colors.forest }}>Hello, {name.split(" ")[0]}!</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }} numberOfLines={1}>
            {profile?.email ?? user?.email}
          </Text>
        </View>
      </Card>

      {/* Segmented control instead of the website's tab links */}
      <View style={styles.segment}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[styles.segmentItem, tab === t.key && styles.segmentActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t.key }}
          >
            <Text style={[styles.segmentText, tab === t.key && { color: colors.white }]}>
              {t.label} ({counts[t.key]})
            </Text>
          </Pressable>
        ))}
      </View>

      {data.loading ? (
        <Loading />
      ) : data.error ? (
        <Empty icon="cloud-offline-outline" text={data.error} cta="Try again" onPress={data.reload} />
      ) : tab === "orders" ? (
        data.data!.orders.length ? (
          data.data!.orders.map((o) => (
            <Card key={o.id} style={{ gap: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600", fontSize: 15, color: colors.ink }}>Order #{orderCode(o.order_no)}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    {shortDate(o.created_at)} · {o.city}, {o.state}
                  </Text>
                </View>
                <Badge status={o.status} map={ORDER_STATUS} />
              </View>
              {o.order_items.map((i, idx) => (
                <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Image source={{ uri: imageUri(i.products?.image_url) }} style={{ width: 44, height: 44, borderRadius: 6 }} />
                  <Text style={{ flex: 1, fontSize: 14, color: colors.ink }}>
                    {i.products?.name ?? "Wreath"} × {i.quantity}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.ink }}>{naira(i.unit_price_kobo * i.quantity)}</Text>
                </View>
              ))}
              <Text style={{ textAlign: "right", fontWeight: "700", color: colors.forest, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 8 }}>
                Total {naira(o.total_kobo)}
              </Text>
            </Card>
          ))
        ) : (
          <Empty icon="receipt-outline" text="You haven't ordered any wreaths yet." cta="Shop Wreaths" onPress={() => router.push("/shop")} />
        )
      ) : tab === "bookings" ? (
        data.data!.bookings.length ? (
          data.data!.bookings.map((b) => (
            <Card key={b.id} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontWeight: "600", fontSize: 15, color: colors.ink }}>
                  {b.occasion}
                  {b.wreath_type ? ` · ${b.wreath_type}` : ""}
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  Requested {shortDate(b.created_at)}
                  {b.preferred_date ? ` · Needed by ${shortDate(b.preferred_date)}` : ""}
                  {b.budget ? ` · ${b.budget}` : ""}
                </Text>
              </View>
              <Badge status={b.status} map={BOOKING_STATUS} />
            </Card>
          ))
        ) : (
          <Empty icon="color-palette-outline" text="No custom wreath requests yet." cta="Book a Custom Wreath" onPress={() => router.push("/book")} />
        )
      ) : data.data!.saved.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {data.data!.saved.map((p) => (
            <Pressable key={p.id} onPress={() => router.push(`/product/${p.id}`)} style={[styles.saved, { width: savedWidth }]}>
              <Image source={{ uri: imageUri(p.image_url) }} style={{ width: "100%", aspectRatio: 1 }} contentFit="cover" />
              <View style={{ padding: 10, gap: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: "500", color: colors.ink }} numberOfLines={1}>
                  {p.name}
                </Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontWeight: "700", color: colors.forest, fontSize: 13 }}>{p.stock > 0 ? naira(p.price_kobo) : "Sold out"}</Text>
                  <Pressable onPress={() => unsave(p.id)} hitSlop={10} accessibilityLabel={`Remove ${p.name} from saved`}>
                    <Ionicons name="heart" size={20} color={colors.rose} />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <Empty icon="heart-outline" text="Tap the heart on any wreath to keep it here." cta="Browse Wreaths" onPress={() => router.push("/shop")} />
      )}

      {profile?.is_admin && (
        <Button title="Open admin dashboard" variant="forest" icon="settings-outline" onPress={() => WebBrowser.openBrowserAsync(`${SITE_URL}/admin`)} />
      )}
      <InfoLinks />
      <Button title="Log out" variant="outline" icon="log-out-outline" onPress={confirmSignOut} />
    </ScrollView>
  );
}

function InfoLinks() {
  const links: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }[] = [
    { label: "About TafriTessy", icon: "information-circle-outline", onPress: () => router.push("/about") },
    { label: "Privacy Policy", icon: "shield-checkmark-outline", onPress: () => WebBrowser.openBrowserAsync(`${SITE_URL}/privacy`) },
    { label: "Terms", icon: "document-text-outline", onPress: () => WebBrowser.openBrowserAsync(`${SITE_URL}/terms`) },
  ];
  return (
    <Card style={{ padding: 0 }}>
      {links.map((l, i) => (
        <Pressable
          key={l.label}
          onPress={l.onPress}
          style={({ pressed }) => [styles.link, i > 0 && styles.linkBorder, pressed && { backgroundColor: colors.cream }]}
        >
          <Ionicons name={l.icon} size={20} color={colors.forest} />
          <Text style={{ flex: 1, fontSize: 15, color: colors.ink }}>{l.label}</Text>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>
      ))}
    </Card>
  );
}

function Badge({ status, map }: { status: string; map: Record<string, { label: string; bg: string; fg: string }> }) {
  const s = map[status] ?? { label: status, bg: "#f3f4f6", fg: "#4b5563" };
  return (
    <View style={{ backgroundColor: s.bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ color: s.fg, fontSize: 12, fontWeight: "600" }}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 56, height: 56, borderRadius: 28 },
  segment: { flexDirection: "row", backgroundColor: colors.white, borderRadius: radius.pill, padding: 4, ...shadow },
  segmentItem: { flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: "center" },
  segmentActive: { backgroundColor: colors.forest },
  segmentText: { fontSize: 13, fontWeight: "600", color: colors.ink },
  saved: { backgroundColor: colors.white, borderRadius: radius.md, overflow: "hidden", ...shadow },
  link: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  linkBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
