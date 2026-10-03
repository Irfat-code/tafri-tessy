import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, serif, shadow } from "@/lib/theme";

type ButtonVariant = "rose" | "forest" | "outline" | "white" | "whatsapp" | "ghost";

export function Button({
  title,
  variant = "rose",
  loading = false,
  icon,
  style,
  disabled,
  ...rest
}: PressableProps & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}) {
  const v = buttonVariants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? v.pressed : v.bg, borderColor: v.border },
        (disabled || loading) && { opacity: 0.6 },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={v.text} />}
          <Text style={[styles.buttonText, { color: v.text }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const buttonVariants: Record<ButtonVariant, { bg: string; pressed: string; text: string; border: string }> = {
  rose: { bg: colors.rose, pressed: colors.roseDark, text: colors.white, border: colors.rose },
  forest: { bg: colors.forest, pressed: "#173b2c", text: colors.white, border: colors.forest },
  outline: { bg: colors.white, pressed: colors.cream, text: colors.ink, border: "#d1d5db" },
  white: { bg: colors.white, pressed: colors.cream, text: colors.forest, border: colors.white },
  whatsapp: { bg: colors.whatsapp, pressed: "#1ebe5b", text: colors.white, border: colors.whatsapp },
  ghost: { bg: "transparent", pressed: "rgba(255,255,255,0.12)", text: colors.white, border: colors.white },
};

export function Title({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active ? styles.chipActive : null]}
    >
      <Text style={[styles.chipText, active && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

export function QuantityStepper({
  value,
  max,
  onChange,
  size = "md",
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
  size?: "sm" | "md";
}) {
  const pad = size === "sm" ? 6 : 10;
  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityLabel="Decrease"
        disabled={value <= 1}
        onPress={() => onChange(Math.max(1, value - 1))}
        style={{ padding: pad, opacity: value <= 1 ? 0.35 : 1 }}
      >
        <Ionicons name="remove" size={18} color={colors.ink} />
      </Pressable>
      <Text style={styles.stepperValue}>{value}</Text>
      <Pressable
        accessibilityLabel="Increase"
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + 1))}
        style={{ padding: pad, opacity: value >= max ? 0.35 : 1 }}
      >
        <Ionicons name="add" size={18} color={colors.ink} />
      </Pressable>
    </View>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export function Input(props: TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      placeholderTextColor="#9ca3af"
      {...props}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
      style={[styles.input, focused && { borderColor: colors.rose }, props.multiline && { minHeight: 100, textAlignVertical: "top" }, props.style]}
    />
  );
}

// A form "select" that opens a native bottom sheet list, like a picker on a phone.
export function SelectField({
  value,
  options,
  placeholder,
  onChange,
  title,
}: {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (v: string) => void;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={[styles.input, styles.select]} accessibilityRole="button">
        <Text style={{ color: value ? colors.ink : "#9ca3af", fontSize: 15, flex: 1 }}>{value || placeholder}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </Pressable>
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={title}>
        <FlatList
          data={options}
          keyExtractor={(o) => o}
          style={{ maxHeight: 420 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onChange(item);
                setOpen(false);
              }}
              style={({ pressed }) => [styles.option, pressed && { backgroundColor: colors.cream }]}
            >
              <Text style={{ fontSize: 16, flex: 1, color: colors.ink }}>{item}</Text>
              {item === value && <Ionicons name="checkmark" size={20} color={colors.rose} />}
            </Pressable>
          )}
        />
      </BottomSheet>
    </>
  );
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <SafeAreaView edges={["bottom"]} style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={colors.muted} />
          </Pressable>
        </View>
        {children}
      </SafeAreaView>
    </Modal>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <View style={styles.errorBox}>
      <Text style={{ color: colors.danger, fontSize: 14 }}>{message}</Text>
    </View>
  );
}

export function Empty({
  icon = "flower-outline",
  text,
  cta,
  onPress,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  text: string;
  cta?: string;
  onPress?: () => void;
}) {
  return (
    <Card style={{ alignItems: "center", paddingVertical: 36, gap: 12 }}>
      <Ionicons name={icon} size={40} color={colors.rose} />
      <Text style={{ color: colors.muted, textAlign: "center", fontSize: 15 }}>{text}</Text>
      {cta && onPress && <Button title={cta} onPress={onPress} style={{ paddingHorizontal: 24 }} />}
    </Card>
  );
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
      <ActivityIndicator size="large" color={colors.rose} />
    </View>
  );
}

export function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={[{ fontSize: bold ? 17 : 14, color: colors.ink }, bold && { fontWeight: "700" }]}>{label}</Text>
      <Text style={[{ fontSize: bold ? 17 : 14, color: colors.ink }, bold && { fontWeight: "700" }]}>{value}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  buttonText: { fontSize: 16, fontWeight: "600" },
  title: { fontFamily: serif, fontSize: 24, color: colors.forest },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: 16, ...shadow },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipText: { fontSize: 14, color: colors.ink },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: radius.sm,
    backgroundColor: colors.white,
  },
  stepperValue: { minWidth: 26, textAlign: "center", fontSize: 16, color: colors.ink },
  label: { fontSize: 14, color: colors.ink, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
  },
  select: { flexDirection: "row", alignItems: "center" },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 8,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
    marginTop: 8,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sheetTitle: { fontFamily: serif, fontSize: 20, color: colors.forest },
  errorBox: { backgroundColor: colors.dangerBg, borderRadius: radius.sm, padding: 12 },
});
