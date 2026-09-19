import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

const PRESS_DOWN_SCALE = 0.97;
const PRESS_IN_DURATION_MS = 110;
const SPRING_CONFIG = { damping: 15, stiffness: 280 };

/**
 * Premium press interaction: quick scale-down on touch, springy release.
 * Spread `handlers` onto a Pressable and `animatedStyle` onto an Animated.View.
 */
export function usePressScale() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withTiming(PRESS_DOWN_SCALE, { duration: PRESS_IN_DURATION_MS });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG);
  };

  return { animatedStyle, handlers: { onPressIn, onPressOut } };
}
