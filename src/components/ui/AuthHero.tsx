import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, type LucideIcon } from "lucide-react-native";
import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/theme";

export interface AuthHeroProps {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  compact?: boolean;
}

/** Branded hero shared by account-entry screens. */
export function AuthHero({
  title,
  subtitle,
  icon: Icon = Sparkles,
  compact = false,
}: AuthHeroProps): ReactElement {
  return (
    <View className={`items-center ${compact ? "mb-6" : "mb-8"}`}>
      <View style={[styles.markShadow, compact ? styles.compactMark : styles.mark]}>
        <LinearGradient
          colors={["#8D7FFF", "#4A3F9E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.markGradient}
        >
          <View style={styles.markHighlight} />
          <Icon
            size={compact ? 24 : 28}
            color={colors.gold}
            strokeWidth={1.8}
          />
        </LinearGradient>
      </View>

      <Text className="mt-5 font-inter-bold text-[10px] uppercase tracking-[3px] text-primary-strong">
        MMCARD · DIGITAL ID
      </Text>
      <Text
        className={`mt-2 text-center font-inter-extrabold tracking-tight text-ink ${
          compact ? "text-[28px]" : "text-[34px]"
        }`}
      >
        {title}
      </Text>
      <Text className="mt-2 max-w-[320px] text-center font-inter-regular text-sm leading-5 text-muted">
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 72,
    height: 72,
  },
  compactMark: {
    width: 62,
    height: 62,
  },
  markShadow: {
    borderRadius: 24,
    padding: 1,
    backgroundColor: "rgba(168,157,255,0.36)",
    shadowColor: colors.primary,
    shadowOpacity: 0.36,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  markGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
    overflow: "hidden",
  },
  markHighlight: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
});
