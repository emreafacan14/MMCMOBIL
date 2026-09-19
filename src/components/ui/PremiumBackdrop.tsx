import { LinearGradient } from "expo-linear-gradient";
import type { ReactElement } from "react";
import { StyleSheet, View } from "react-native";

/** Ambient app-wide canvas shared by every route. */
export function PremiumBackdrop(): ReactElement {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={["#11142A", "#090A14", "#070810"]}
        locations={[0, 0.46, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.orb, styles.topOrb]} />
      <View style={[styles.orb, styles.sideOrb]} />
      <LinearGradient
        colors={["rgba(90,215,255,0.08)", "rgba(118,103,248,0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.diagonalGlow}
      />
      <View style={styles.topHairline} />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  topOrb: {
    width: 310,
    height: 310,
    top: -190,
    right: -100,
    backgroundColor: "rgba(118,103,248,0.17)",
  },
  sideOrb: {
    width: 240,
    height: 240,
    top: "48%",
    left: -190,
    backgroundColor: "rgba(90,215,255,0.055)",
  },
  diagonalGlow: {
    position: "absolute",
    width: 230,
    height: 440,
    top: -80,
    left: -150,
    transform: [{ rotate: "28deg" }],
  },
  topHairline: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(168,157,255,0.22)",
  },
});
