import { ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PHOTOS } from "@/lib/constants";
import { colors, radius, serif } from "@/lib/theme";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button, Card } from "@/components/ui";

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }[] = [
  { icon: "leaf-outline", title: "Handmade", text: "Each wreath is arranged by hand with care and attention to detail." },
  { icon: "color-palette-outline", title: "Made for you", text: "Tell us your occasion, colours and budget, and we'll design it with you." },
  { icon: "car-outline", title: "Delivered", text: "We deliver across Nigeria and keep you updated by email." },
];

// Same words as the website's About page.
export default function AboutScreen() {
  const p = { color: "#374151", fontSize: 15, lineHeight: 23 };
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 32 }}>
      <Image source={PHOTOS.hero} style={{ width: "100%", aspectRatio: 1, borderRadius: radius.lg }} contentFit="cover" />
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 11, letterSpacing: 2, color: colors.forest }}>
          WREATHS <Text style={{ color: colors.rose }}>•</Text> DESIGNS <Text style={{ color: colors.rose }}>•</Text> MORE
        </Text>
        <Text style={{ fontFamily: serif, fontSize: 28, color: colors.forest }}>Made by hand, made with love</Text>
        <Text style={p}>
          Welcome to TafriTessy, where flowers become beautiful expressions of love, remembrance, celebration and joy.
        </Text>
        <Text style={p}>
          We create handcrafted wreaths and floral pieces for life&apos;s meaningful moments: funerals and memorial tributes,
          Christmas and festive celebrations, birthdays, anniversaries, weddings, housewarmings, thoughtful gifts and everyday décor.
        </Text>
        <Text style={p}>
          Flowers can express love when words are hard to find, bring comfort in times of loss and add warmth to every celebration.
          That&apos;s why every TafriTessy piece is made with care, creativity and attention to detail.
        </Text>
        <Text style={{ fontFamily: serif, fontSize: 18, fontStyle: "italic", color: colors.rose }}>
          Thoughtfully crafted. Beautifully expressed. Made for every meaningful moment.
        </Text>
      </View>

      {FEATURES.map((f) => (
        <Card key={f.title} style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
          <Ionicons name={f.icon} size={30} color={colors.rose} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: serif, fontSize: 18, color: colors.forest }}>{f.title}</Text>
            <Text style={{ color: colors.muted, fontSize: 14 }}>{f.text}</Text>
          </View>
        </Card>
      ))}

      <View style={{ backgroundColor: colors.forest, borderRadius: radius.lg, padding: 22, gap: 12 }}>
        <Text style={{ fontFamily: serif, fontSize: 24, color: colors.white, textAlign: "center" }}>Let&apos;s create something beautiful</Text>
        <Button title="Shop Wreaths" onPress={() => router.push("/shop")} />
        <Button title="Book a Custom Design" variant="ghost" onPress={() => router.push("/book")} />
        <WhatsAppButton />
      </View>
    </ScrollView>
  );
}
