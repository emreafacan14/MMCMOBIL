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

/**
 * Skeleton placeholder that mirrors CardVisual shape & layout.
 */
export function CardVisualSkeleton({ compact = false }: { compact?: boolean }): ReactElement {
  return (
    <View
      className="w-full justify-between overflow-hidden rounded-[28px] border border-line bg-surface/60 p-5"
      style={{ aspectRatio: compact ? 2.6 : 1.75 }}
    >
      <View className="flex-row items-center justify-between">
        <Skeleton className="h-11 w-11 rounded-2xl" />
        <View className="flex-row items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-5 w-5 rounded-md" />
        </View>
      </View>
      <View className="items-center gap-2">
        <Skeleton className="h-7 w-32 rounded-lg" />
        <Skeleton className="h-3 w-20 rounded" />
      </View>
      <View className="gap-1.5">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-3.5 w-24 rounded" />
      </View>
    </View>
  );
}

/**
 * Skeleton placeholder for list items (addresses, phones, emails, etc.).
 */
export function ListItemSkeleton({ count = 3 }: { count?: number }): ReactElement {
  return (
    <View className="gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className="flex-row items-center overflow-hidden rounded-[24px] border border-line bg-elevated/60 p-4"
        >
          <Skeleton className="h-10 w-10 rounded-xl" />
          <View className="ml-3 flex-1 gap-1.5">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-48 rounded" />
          </View>
          <View className="ml-2 flex-row gap-2">
            <Skeleton className="h-[34px] w-[34px] rounded-xl" />
            <Skeleton className="h-[34px] w-[34px] rounded-xl" />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Skeleton placeholder for form fields.
 */
export function FormFieldsSkeleton({ count = 3 }: { count?: number }): ReactElement {
  return (
    <View className="gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className="gap-1.5">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </View>
      ))}
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
