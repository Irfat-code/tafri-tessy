import type { ColorValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router/js-tabs";
import { useCart } from "@/lib/cart";
import { colors, serif } from "@/lib/theme";

type IconName = keyof typeof Ionicons.glyphMap;

function icon(active: IconName, inactive: IconName) {
  return ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
    <Ionicons name={focused ? active : inactive} color={color as string} size={size} />
  );
}

// Bottom tabs replace the website's header menu.
export default function TabsLayout() {
  const { count } = useCart();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.rose,
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: "rgba(217,102,122,0.15)" },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
        headerStyle: { backgroundColor: colors.cream },
        headerTitleStyle: { fontFamily: serif, color: colors.forest, fontSize: 22 },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.cream },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", headerShown: false, tabBarIcon: icon("home", "home-outline") }} />
      <Tabs.Screen name="shop" options={{ title: "Shop", headerTitle: "Shop Our Wreaths", tabBarIcon: icon("flower", "flower-outline") }} />
      <Tabs.Screen name="book" options={{ title: "Custom", headerTitle: "Book a Custom Wreath", tabBarIcon: icon("color-palette", "color-palette-outline") }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          headerTitle: "Your Cart",
          tabBarIcon: icon("bag", "bag-outline"),
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.rose, color: colors.white, fontSize: 11 },
        }}
      />
      <Tabs.Screen name="account" options={{ title: "Account", headerTitle: "My Account", tabBarIcon: icon("person", "person-outline") }} />
    </Tabs>
  );
}
