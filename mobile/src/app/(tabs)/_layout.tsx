import { Text } from "react-native";
import { Tabs } from "expo-router/tabs";
import { useCart } from "@/lib/cart";
import { colors } from "@/lib/config";

const icon = (emoji: string) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

export default function TabsLayout() {
  const { count } = useCart();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.cream },
        headerTintColor: colors.forest,
        headerTitleStyle: { fontFamily: "serif" },
        tabBarActiveTintColor: colors.rose,
        tabBarStyle: { backgroundColor: colors.white },
        sceneStyle: { backgroundColor: colors.cream },
      }}>
      <Tabs.Screen name="index" options={{ title: "TafriTessy", tabBarLabel: "Shop", tabBarIcon: icon("🌸") }} />
      <Tabs.Screen name="cart" options={{
        title: "Your Cart", tabBarLabel: "Cart", tabBarIcon: icon("🛒"),
        tabBarBadge: count > 0 ? count : undefined, tabBarBadgeStyle: { backgroundColor: colors.rose },
      }} />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: icon("👤") }} />
    </Tabs>
  );
}
