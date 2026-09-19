import { ChevronLeft } from "lucide-react-native";
import type { ReactElement, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";
import { useHaptic } from "@/hooks/useHaptic";

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Large hero-style title block with optional subtitle. */
  large?: boolean;
  /** When provided, renders the circular back button. */
  onBack?: () => void;
  /** Slot aligned to the trailing edge of the header row. */
  right?: ReactNode;
  /** Disable horizontal padding when the parent already provides screen gutters. */
  inset?: boolean;
}

function HeaderBackButton({ onPress }: { onPress: () => void }): ReactElement {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      className="h-11 w-11 items-center justify-center rounded-2xl border border-line bg-surface-strong"
    >
      <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
    </Pressable>
  );
}

/**
 * Screen header handling safe-area top inset. Compact mode renders a single
 * row; large mode stacks the back button above a big title block.
 */
export function ScreenHeader({
  title,
  subtitle,
  large = false,
  onBack,
  right,
  inset = true,
}: ScreenHeaderProps): ReactElement {
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();

  const handleBack = (): void => {
    haptic("light");
    onBack?.();
  };

  if (!large) {
    return (
      <View
        style={{ paddingTop: insets.top + 10 }}
        className={`${inset ? "px-5" : ""} pb-4`}
      >
        <View className="flex-row items-center gap-3">
          {onBack !== undefined ? <HeaderBackButton onPress={handleBack} /> : null}
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="font-inter-bold text-xl tracking-tight text-ink"
            >
              {title}
            </Text>
            {subtitle !== undefined ? (
              <Text numberOfLines={1} className="mt-0.5 text-xs text-muted">
                {subtitle}
              </Text>
            ) : null}
          </View>
          {right}
        </View>
      </View>
    );
  }

  return (
    <View
      style={{ paddingTop: insets.top + 12 }}
      className={`gap-4 ${inset ? "px-5" : ""} pb-5`}
    >
      {onBack !== undefined ? (
        <View className="flex-row">
          <HeaderBackButton onPress={handleBack} />
        </View>
      ) : null}
      <View className="flex-row items-end justify-between gap-3">
        <View className="flex-1">
          <View className="mb-3 h-1 w-10 rounded-full bg-primary" />
          <Text className="font-inter-extrabold text-[30px] leading-tight tracking-tight text-ink">
            {title}
          </Text>
          {subtitle !== undefined ? (
            <Text className="mt-1.5 font-inter-regular text-sm leading-5 text-muted">
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right}
      </View>
    </View>
  );
}
