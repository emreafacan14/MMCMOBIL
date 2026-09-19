import { colors } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useHaptic } from "@/hooks/useHaptic";
import { usePressScale } from "@/hooks/usePressScale";
import type { ReactElement, ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

export type PremiumButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type PremiumButtonSize = "md" | "lg";

export interface PremiumButtonProps {
  label: string;
  onPress: () => void;
  variant?: PremiumButtonVariant;
  size?: PremiumButtonSize;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  /** Stretch to the parent width; set false to hug content. Default true. */
  fullWidth?: boolean;
  /** Layout classes for the outer press target (alignment/flex/grid sizing). */
  wrapperClassName?: string;
  className?: string;
}

interface VariantTokens {
  container: string;
  label: string;
  spinner: string;
}

const VARIANT_TOKENS: Record<PremiumButtonVariant, VariantTokens> = {
  primary: {
    container: "",
    label: "text-white",
    spinner: "#FFFFFF",
  },
  secondary: {
    container: "border border-line bg-surface-strong",
    label: "text-ink",
    spinner: colors.ink,
  },
  ghost: {
    container: "bg-transparent",
    label: "text-primary-strong",
    spinner: colors.primaryStrong,
  },
  danger: {
    container: "border border-danger/30 bg-danger/10",
    label: "text-danger",
    spinner: colors.danger,
  },
};

const SIZE_HEIGHT: Record<PremiumButtonSize, string> = {
  lg: "h-14",
  md: "h-11",
};

/** Opacity feedback layered on top of the press scale animation. */
function resolveFeedbackStyle(
  variant: PremiumButtonVariant,
  pressed: boolean,
  loading: boolean,
  disabled: boolean,
): { opacity: number } | null {
  if (disabled) {
    return { opacity: 0.5 };
  }
  if (variant === "primary" && (pressed || loading)) {
    return { opacity: 0.8 };
  }
  return null;
}

/**
 * The app's standard button: press-scale physics, haptic on touch-down,
 * four visual variants and a loading state that replaces all content.
 */
export function PremiumButton({
  label,
  onPress,
  variant = "primary",
  size = "lg",
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  wrapperClassName,
  className,
}: PremiumButtonProps): ReactElement {
  const haptic = useHaptic();
  const { animatedStyle, handlers } = usePressScale();
  const tokens = VARIANT_TOKENS[variant];
  const inactive = disabled || loading;
  const surfaceClass = `flex-row items-center justify-center overflow-hidden rounded-2xl ${
    SIZE_HEIGHT[size]
  } ${size === "md" ? "gap-1.5 px-2" : "gap-2 px-4"} ${tokens.container} ${
    className ?? ""
  }`;

  const handlePressIn = (): void => {
    if (!inactive) {
      haptic("light");
    }
    handlers.onPressIn();
  };

  const content = loading ? (
    <ActivityIndicator color={tokens.spinner} />
  ) : (
    <>
      {icon}
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        className={`shrink text-center font-inter-semibold ${
          size === "md" ? "text-[13px] tracking-normal" : "text-[15px] tracking-wide"
        } ${tokens.label}`}
      >
        {label}
      </Text>
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      onPressIn={handlePressIn}
      onPressOut={handlers.onPressOut}
      className={`${fullWidth ? "w-full" : "self-center"} ${
        wrapperClassName ?? ""
      }`}
    >
      {({ pressed }): ReactElement => (
        <Animated.View
          style={[
            animatedStyle,
            variant === "primary" ? styles.primaryDepth : styles.secondaryDepth,
            resolveFeedbackStyle(variant, pressed, loading, disabled),
          ]}
        >
          {variant === "primary" ? (
            <View className={surfaceClass}>
              <LinearGradient
                pointerEvents="none"
                colors={["#8D7FFF", "#6859E8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View pointerEvents="none" style={styles.highlight} />
              {content}
            </View>
          ) : (
            <View className={surfaceClass}>{content}</View>
          )}
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryDepth: {
    shadowColor: colors.primary,
    shadowOpacity: 0.32,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 8,
  },
  secondaryDepth: {
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  highlight: {
    position: "absolute",
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.34)",
  },
});
