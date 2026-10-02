import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors } from "@/lib/config";

export function Button({
  title, onPress, variant = "rose", disabled, loading, style,
}: {
  title: string;
  onPress: () => void;
  variant?: "rose" | "forest" | "outline";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  const bg = variant === "rose" ? colors.rose : variant === "forest" ? colors.forest : colors.white;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === "outline" && styles.outline,
        style,
      ]}>
      {loading
        ? <ActivityIndicator color={variant === "outline" ? colors.forest : colors.white} />
        : <Text style={[styles.buttonText, variant === "outline" && { color: colors.forest }]}>{title}</Text>}
    </Pressable>
  );
}

export function Stepper({ value, min = 1, max, onChange }: { value: number; min?: number; max: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={() => onChange(Math.max(min, value - 1))} style={styles.stepBtn} hitSlop={8}>
        <Text style={styles.stepText}>−</Text>
      </Pressable>
      <Text style={styles.stepValue}>{value}</Text>
      <Pressable onPress={() => onChange(Math.min(max, value + 1))} style={styles.stepBtn} hitSlop={8}>
        <Text style={styles.stepText}>+</Text>
      </Pressable>
    </View>
  );
}

export function Center({ children }: { children: React.ReactNode }) {
  return <View style={styles.center}>{children}</View>;
}

export const text = StyleSheet.create({
  title: { fontFamily: "serif", fontSize: 26, color: colors.forest },
  heading: { fontFamily: "serif", fontSize: 20, color: colors.forest },
  body: { fontSize: 15, color: colors.ink, lineHeight: 22 },
  muted: { fontSize: 13, color: colors.grey },
  price: { fontSize: 16, fontWeight: "700", color: colors.forest },
});

const styles = StyleSheet.create({
  button: { borderRadius: 999, paddingVertical: 14, paddingHorizontal: 20, alignItems: "center", justifyContent: "center" },
  outline: { borderWidth: 1, borderColor: colors.line },
  buttonText: { color: colors.white, fontWeight: "600", fontSize: 15 },
  stepper: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: colors.white },
  stepBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  stepText: { fontSize: 18, color: colors.ink },
  stepValue: { minWidth: 24, textAlign: "center", fontSize: 15 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12, backgroundColor: colors.cream },
});
