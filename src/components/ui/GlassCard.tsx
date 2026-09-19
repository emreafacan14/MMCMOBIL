import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactElement, ReactNode } from "react";
import { StyleSheet, View } from "react-native";

export interface GlassCardProps {
  children: ReactNode;
  /** Extra Tailwind classes appended to the outer container. */
  className?: string;
  /** When provided, renders an expo-blur backdrop behind the content. */
  blurIntensity?: number;
}

/**
 * Rounded glass surface. Without `blurIntensity` it is a plain translucent
 * panel; with it, a dark BlurView backs the content for true glassmorphism.
 */
export function GlassCard({
  children,
  className,
  blurIntensity,
}: GlassCardProps): ReactElement {
  if (blurIntensity === undefined) {
    return (
      <View
        className={`overflow-hidden rounded-[26px] border border-line bg-elevated/75 ${
          className ?? ""
        }`}
        style={styles.depth}
      >
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(255,255,255,0.065)", "rgba(118,103,248,0.018)"]}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    );
  }

  return (
    <View
      className={`overflow-hidden rounded-[26px] border border-line bg-transparent ${
        className ?? ""
      }`}
      style={styles.depth}
    >
      <BlurView
        intensity={Math.max(blurIntensity, 48)}
        tint="dark"
        blurMethod="none"
      >
        <View className="bg-elevated/45">{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  depth: {
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
});
