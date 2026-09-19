import type { LucideIcon } from "lucide-react-native";
import type { ReactElement } from "react";
import { Text, View } from "react-native";
import { colors } from "@/constants/theme";
import { PremiumButton } from "@/components/ui/PremiumButton";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const noop = (): void => {};

/**
 * Centered empty-state block: icon in a glass circle, title, optional
 * description and an optional secondary action button.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps): ReactElement {
  return (
    <View className="items-center gap-3 px-5 py-12">
      <View className="mb-2 h-[72px] w-[72px] items-center justify-center rounded-[26px] border border-primary/25 bg-primary-dim">
        <Icon size={30} color={colors.primaryStrong} strokeWidth={1.7} />
      </View>
      <Text className="font-inter-bold text-lg tracking-tight text-ink">{title}</Text>
      {description !== undefined ? (
        <Text className="px-6 text-center font-inter-regular text-sm leading-5 text-muted">
          {description}
        </Text>
      ) : null}
      {actionLabel !== undefined ? (
        <PremiumButton
          label={actionLabel}
          onPress={onAction ?? noop}
          variant="secondary"
          size="md"
          fullWidth={false}
          wrapperClassName="mt-1 self-center"
          className="px-6"
        />
      ) : null}
    </View>
  );
}
