import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp, whatsappLink } from "@/lib/app";
import { BUDGETS, MAX_PHOTO_BYTES, OCCASIONS, WREATH_TYPES } from "@/lib/constants";
import { isoDate, shortDate } from "@/lib/format";
import { colors, radius } from "@/lib/theme";
import WhatsAppButton from "@/components/WhatsAppButton";
import { BottomSheet, Button, Card, ErrorBox, Field, Input, SelectField, Title } from "@/components/ui";

type Photo = { uri: string; name: string; type: string };

const STEPS = [
  { title: "1. Share your idea", text: "Fill in the form below" },
  { title: "2. Get a quote", text: "We reply in 24–48 hours" },
  { title: "3. We create it", text: "Handmade with love" },
];

const empty = {
  full_name: "",
  email: "",
  phone: "",
  occasion: "",
  wreath_type: "",
  budget: "",
  colours: "",
  description: "",
};

export default function BookScreen() {
  const { user, api, config } = useApp();
  const [form, setForm] = useState(empty);
  const [date, setDate] = useState<Date | null>(null);
  const [iosDateOpen, setIosDateOpen] = useState(false);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const scroll = useRef<ScrollView>(null);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, full_name: f.full_name || user.user_metadata?.full_name || "", email: f.email || user.email || "" }));
  }, [user]);

  const set = (field: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [field]: value }));

  // Earliest date is tomorrow, like the website.
  const tomorrow = new Date(Date.now() + 86400000);

  function pickDate() {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: date ?? tomorrow,
        mode: "date",
        minimumDate: tomorrow,
        onValueChange: (_e, d) => setDate(d),
      });
    } else {
      setIosDateOpen(true);
    }
  }

  async function pickPhoto() {
    setError("");
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_PHOTO_BYTES) return setError("Photo must be smaller than 4MB.");
    const type = asset.mimeType ?? "image/jpeg";
    if (!["image/jpeg", "image/png", "image/webp"].includes(type)) return setError("Photo must be a JPG, PNG or WEBP image.");
    const ext = type.split("/")[1].replace("jpeg", "jpg");
    setPhoto({ uri: asset.uri, type, name: asset.fileName ?? `inspiration.${ext}` });
  }

  async function submit() {
    setError("");
    if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim() || !form.occasion) {
      return setError("Please fill in your name, email, phone and occasion.");
    }
    setStatus("sending");
    try {
      // The same multipart form the website posts to /api/bookings.
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => body.append(k, v));
      if (date) body.append("preferred_date", isoDate(date));
      if (photo) body.append("inspiration", photo as unknown as Blob);
      const res = await api("/api/bookings", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus("done");
      scroll.current?.scrollTo({ y: 0, animated: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card style={{ alignItems: "center", gap: 12, paddingVertical: 32 }}>
          <Text style={{ fontSize: 52 }}>💐</Text>
          <Title>Request received!</Title>
          <Text style={{ textAlign: "center", color: colors.muted, lineHeight: 22 }}>
            Thank you. We&apos;ll review your idea and reply within 24–48 hours with a quote. A confirmation has been sent to your email.
          </Text>
          <Button title="Browse ready-made wreaths" onPress={() => router.push("/shop")} style={{ alignSelf: "stretch" }} />
          <Button
            title="Send another request"
            variant="outline"
            style={{ alignSelf: "stretch" }}
            onPress={() => {
              setForm({ ...empty, full_name: form.full_name, email: form.email, phone: form.phone });
              setDate(null);
              setPhoto(null);
              setStatus("idle");
            }}
          />
        </Card>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 6 }}>
          <Text style={{ color: colors.rose, fontSize: 14 }}>Made just for you</Text>
          <Text style={{ color: "#4b5563", fontSize: 15, lineHeight: 22 }}>
            Tell us about your occasion, colours and style, and we&apos;ll design a wreath that&apos;s uniquely yours.
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          {STEPS.map((s) => (
            <View key={s.title} style={styles.step}>
              <Text style={{ color: colors.forest, fontWeight: "700", fontSize: 12, textAlign: "center" }}>{s.title}</Text>
              <Text style={{ color: colors.muted, fontSize: 11, textAlign: "center" }}>{s.text}</Text>
            </View>
          ))}
        </View>

        {whatsappLink(config.whatsappNumber) && (
          <Card style={{ gap: 10 }}>
            <Text style={{ fontWeight: "600", color: colors.forest, fontSize: 15 }}>Prefer to talk it through?</Text>
            <Text style={{ color: colors.muted, fontSize: 14 }}>Chat with us on WhatsApp for a quick consultation, or fill in the form below.</Text>
            <WhatsAppButton />
          </Card>
        )}

        <Card style={{ gap: 14 }}>
          <Title style={{ fontSize: 20 }}>Your details</Title>
          <Field label="Full name *">
            <Input value={form.full_name} onChangeText={set("full_name")} autoComplete="name" />
          </Field>
          <Field label="Email *">
            <Input value={form.email} onChangeText={set("email")} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          </Field>
          <Field label="Phone / WhatsApp *">
            <Input value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" placeholder="0801 234 5678" autoComplete="tel" />
          </Field>
        </Card>

        <Card style={{ gap: 14 }}>
          <Title style={{ fontSize: 20 }}>Your wreath</Title>
          <Field label="Occasion *">
            <SelectField title="Occasion" value={form.occasion} options={OCCASIONS} placeholder="Choose an occasion" onChange={set("occasion")} />
          </Field>
          <Field label="Date needed">
            <Pressable onPress={pickDate} style={[styles.dateField]} accessibilityRole="button">
              <Ionicons name="calendar-outline" size={18} color={colors.muted} />
              <Text style={{ flex: 1, fontSize: 15, color: date ? colors.ink : "#9ca3af" }}>{date ? shortDate(date) : "Choose a date"}</Text>
              {date && (
                <Pressable onPress={() => setDate(null)} hitSlop={10} accessibilityLabel="Clear date">
                  <Ionicons name="close-circle" size={18} color="#9ca3af" />
                </Pressable>
              )}
            </Pressable>
          </Field>
          <Field label="Wreath type">
            <SelectField title="Wreath type" value={form.wreath_type} options={WREATH_TYPES} placeholder="Choose a type" onChange={set("wreath_type")} />
          </Field>
          <Field label="Budget">
            <SelectField title="Budget" value={form.budget} options={BUDGETS} placeholder="Choose a budget" onChange={set("budget")} />
          </Field>
          <Field label="Preferred colours">
            <Input value={form.colours} onChangeText={set("colours")} placeholder="e.g. blush pink, white and gold" />
          </Field>
          <Field label="Tell us about your idea">
            <Input
              value={form.description}
              onChangeText={set("description")}
              multiline
              maxLength={2000}
              placeholder="Size, flowers you love, where it will hang, any message or ribbon…"
            />
          </Field>
          <Field label="Inspiration photo (optional, max 4MB)">
            {photo ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Image source={{ uri: photo.uri }} style={{ width: 96, height: 96, borderRadius: radius.sm }} contentFit="cover" />
                <View style={{ gap: 8 }}>
                  <Pressable onPress={pickPhoto}>
                    <Text style={{ color: colors.rose, fontWeight: "500" }}>Change photo</Text>
                  </Pressable>
                  <Pressable onPress={() => setPhoto(null)}>
                    <Text style={{ color: colors.muted }}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable onPress={pickPhoto} style={styles.photoButton} accessibilityRole="button">
                <Ionicons name="image-outline" size={22} color={colors.rose} />
                <Text style={{ color: colors.rose, fontWeight: "500" }}>Add a photo</Text>
              </Pressable>
            )}
          </Field>
        </Card>

        {!!error && <ErrorBox message={error} />}
        <Button title={status === "sending" ? "Sending…" : "Send My Request"} loading={status === "sending"} onPress={submit} />
        <Text style={{ textAlign: "center", fontSize: 12, color: colors.muted }}>No payment now. We&apos;ll send you a quote first.</Text>
      </ScrollView>

      {Platform.OS === "ios" && (
        <BottomSheet visible={iosDateOpen} onClose={() => setIosDateOpen(false)} title="Date needed">
          <DateTimePicker
            value={date ?? tomorrow}
            mode="date"
            display="inline"
            minimumDate={tomorrow}
            onValueChange={(_e, d) => setDate(d)}
          />
          <View style={{ padding: 16 }}>
            <Button title="Done" onPress={() => setIosDateOpen(false)} />
          </View>
        </BottomSheet>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  step: { flex: 1, backgroundColor: colors.white, borderRadius: radius.sm, padding: 10, gap: 2 },
  dateField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.rose,
    borderRadius: radius.sm,
    paddingVertical: 18,
    backgroundColor: colors.cream,
  },
});

