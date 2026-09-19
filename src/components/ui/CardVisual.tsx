import { Nfc, Sparkles } from "lucide-react-native";
import type { ReactElement } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { CardShell } from "@/components/ui/CardShell";
import { colors, glowShadow, radius } from "@/constants/theme";

export interface CardVisualProps {
  fullName: string;
  compact?: boolean;
}

/** Hero card ratio — shared with FlipCard/QrCardFace so every face matches. */
export const CARD_ASPECT_RATIO = 1.75;
const COMPACT_ASPECT_RATIO = 2.6;

/** First letters of the first two words, uppercased ("" when name is blank). */
function deriveInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter((part) => part.length > 0);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase();
}

/** Gradient business-card preview with initials avatar and full name. */
export function CardVisual({
  fullName,
  compact = false,
}: CardVisualProps): ReactElement {
  const initials = deriveInitials(fullName);

  return (
    <View
      style={[
        styles.card,
        glowShadow,
        {
          borderRadius: radius.xl,
          aspectRatio: compact ? COMPACT_ASPECT_RATIO : CARD_ASPECT_RATIO,
        },
      ]}
    >
      <CardShell>
        <View className={`flex-1 justify-between ${compact ? "p-4" : "p-5"}`}>
          <View className="flex-row items-center justify-between">
            <View className="h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <Text className="font-inter-extrabold text-base text-white">{initials}</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Nfc size={compact ? 16 : 19} color="rgba(255,255,255,0.62)" />
              <Sparkles size={compact ? 14 : 16} color={colors.gold} />
            </View>
          </View>
          {/* Brand wordmark, vertically centered between the top row and the name block. */}
          <View className="items-center">
            <Image
              source={require("../../../assets/logo.png")}
              resizeMode="contain"
              style={compact ? styles.compactLogo : styles.logo}
            />
            <View className="mt-1.5 flex-row items-center gap-1">
              <View className="h-px w-6 bg-gold/50" />
              <Sparkles size={compact ? 9 : 11} color={colors.gold} />
              <View className="h-px w-6 bg-gold/50" />
            </View>
          </View>
          <View>
            {!compact ? (
              <Text className="mb-1 font-inter-semibold text-[10px] uppercase tracking-[2px] text-white/50">
                Digital identity
              </Text>
            ) : null}
            <Text
              numberOfLines={1}
              className={`font-inter-bold tracking-tight text-white ${compact ? "text-base" : "text-[22px]"}`}
            >
              {fullName}
            </Text>
          </View>
        </View>
      </CardShell>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: colors.elevated,
  },
  logo: {
    width: 165,
    height: 55,
  },
  compactLogo: {
    width: 120,
    height: 40,
  },
});
