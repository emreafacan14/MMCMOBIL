import type { ReactElement, ReactNode } from "react";
import { KeyboardStickyView, useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BAR_GAP = 12;

export interface KeyboardActionBarProps {
  children: ReactNode;
}

/**
 * Bottom action surface that owns the bottom safe-area calculation.
 * Closed: respects the device inset. Open: keeps a fixed gap above keyboard.
 */
export function KeyboardActionBar({ children }: KeyboardActionBarProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { progress } = useReanimatedKeyboardAnimation();
  const closedPadding = Math.max(insets.bottom, BAR_GAP);

  const animatedContentStyle = useAnimatedStyle(
    () => ({
      paddingBottom: interpolate(
        progress.value,
        [0, 1],
        [closedPadding, BAR_GAP],
      ),
    }),
    [closedPadding, progress],
  );

  return (
    <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
      <Animated.View
        className="border-t border-line bg-elevated/95 px-5 pt-3"
        style={animatedContentStyle}
      >
        {children}
      </Animated.View>
    </KeyboardStickyView>
  );
}
