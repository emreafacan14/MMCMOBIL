import { useEffect } from "react";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const FLIP_DURATION_MS = 450;

export interface FlipCardProps {
  front: ReactElement;
  back: ReactElement;
  flipped: boolean;
  /** Height/width ratio owned by the wrapper so the layout never jumps. */
  aspectRatio: number;
  /** Optional press handler on the back face, e.g. to flip back. */
  onBackPress?: () => void;
}

/**
 * In-place 3D flip between two faces. Both faces are absolutely positioned
 * and hidden while back-facing, which keeps each side unmirrored. The faces
 * have fixed bounds from the wrapper, so children must fill them (flex: 1 or
 * a matching aspect ratio) instead of sizing themselves from their content.
 */
export function FlipCard({
  front,
  back,
  flipped,
  aspectRatio,
  onBackPress,
}: FlipCardProps): ReactElement {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(flipped ? 180 : 0, {
      duration: FLIP_DURATION_MS,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [flipped, rotation]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotation.value}deg` }],
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotation.value + 180}deg` },
    ],
  }));

  return (
    <View style={[styles.wrapper, { aspectRatio }]}>
      <Animated.View
        pointerEvents={flipped ? "none" : "auto"}
        style={[styles.face, frontStyle]}
      >
        {front}
      </Animated.View>
      <Animated.View
        pointerEvents={flipped ? "auto" : "none"}
        style={[styles.face, backStyle]}
      >
        {onBackPress === undefined ? (
          back
        ) : (
          <Pressable style={styles.fill} onPress={onBackPress}>
            {back}
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  face: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: "hidden",
  },
  fill: {
    flex: 1,
  },
});
