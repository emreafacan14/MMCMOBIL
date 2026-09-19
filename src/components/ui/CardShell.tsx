import { LinearGradient } from "expo-linear-gradient";
import type { ReactElement, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { cardGradient } from "@/constants/theme";

interface CardShellProps {
  children: ReactNode;
}

/**
 * Shared premium card background: base gradient, ambient orbs and the
 * diagonal sheen. Renders as a fragment so the parent stays the layout root.
 */
export function CardShell({ children }: CardShellProps): ReactElement {
  return (
    <>
      {/* Spread: cardGradient arrays are readonly tuples, the prop wants mutable arrays. */}
      <LinearGradient
        style={StyleSheet.absoluteFill}
        colors={[...cardGradient.colors]}
        locations={[...cardGradient.locations]}
        start={cardGradient.start}
        end={cardGradient.end}
      />
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />
      <LinearGradient
        colors={["rgba(255,255,255,0.16)", "rgba(255,255,255,0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.sheen}
      />
      {children}
    </>
  );
}

const styles = StyleSheet.create({
  orbTop: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 999,
    top: -120,
    right: -50,
    backgroundColor: "rgba(90,215,255,0.13)",
  },
  orbBottom: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    bottom: -170,
    left: -50,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  sheen: {
    position: "absolute",
    width: 120,
    top: 0,
    bottom: 0,
    left: -55,
    transform: [{ skewX: "-18deg" }],
  },
});
