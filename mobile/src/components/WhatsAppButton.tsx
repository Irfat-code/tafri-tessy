import { Linking, type StyleProp, type ViewStyle } from "react-native";
import { useApp, whatsappLink } from "@/lib/app";
import { Button } from "@/components/ui";

// Opens a WhatsApp chat with the owner. Hidden when no number is configured,
// like the website's button.
export default function WhatsAppButton({
  label = "Chat on WhatsApp",
  message,
  style,
}: {
  label?: string;
  message?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { config } = useApp();
  const href = whatsappLink(config.whatsappNumber, message);
  if (!href) return null;
  return <Button title={label} variant="whatsapp" icon="logo-whatsapp" onPress={() => Linking.openURL(href)} style={style} />;
}
