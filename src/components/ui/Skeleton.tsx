import type { ReactElement } from "react";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const OPACITY_MIN = 0.35;
const OPACITY_MAX = 0.9;
const SHIMMER_DURATION_MS = 1100;

/**
 * Shimmering loading block. Size and radius come from the caller's className,
 * e.g. `className="h-4 w-32 rounded-full"`.
 */
export function Skeleton({
  className,
}: {
  className?: string;
}): ReactElement {
  const opacity = useSharedValue(OPACITY_MIN);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(OPACITY_MAX, { duration: SHIMMER_DURATION_MS, easing: Easing.linear }),
      -1,
      true,
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      className={className}
      style={className === undefined ? styles.fallback : styles.clip}
    >
      <Animated.View style={[styles.fill, shimmerStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
  },
  fallback: {
    overflow: "hidden",
    height: 16,
    width: "100%",
    borderRadius: 999,
  },
  fill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
});
