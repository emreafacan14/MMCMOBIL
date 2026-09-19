import type { ReactElement, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

export interface ContactRowProps {
  /** Pre-styled leading node (icon, avatar, ...). */
  icon: ReactNode;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  onPress?: () => void;
  /** Trailing slot (chevron, action buttons, ...). */
  right?: ReactNode;
}

function RowBadge({ label }: { label: string }): ReactElement {
  return (
    <View className="ml-2 rounded-full border border-primary/30 bg-primary-dim px-2 py-0.5">
      <Text className="font-inter-semibold text-[10px] text-primary-strong">
        {label}
      </Text>
    </View>
  );
}

/**
 * Single list row for contact entries: leading icon, title (+ optional badge
 * and subtitle) and an optional trailing slot. Tappable when onPress is given.
 */
export function ContactRow({
  icon,
  title,
  subtitle,
  badge,
  onPress,
  right,
}: ContactRowProps): ReactElement {
  const hasBadge = badge !== null && badge !== undefined && badge !== "";

  const content = (
    <View className="flex-row items-center gap-3 rounded-[20px] border border-line bg-elevated/70 px-4 py-3.5">
      <View className="h-10 w-10 items-center justify-center rounded-2xl bg-surface-strong">
        {icon}
      </View>
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text numberOfLines={1} className="flex-shrink font-inter-medium text-[15px] text-ink">
            {title}
          </Text>
          {hasBadge ? <RowBadge label={badge} /> : null}
        </View>
        {subtitle !== null && subtitle !== undefined && subtitle !== "" ? (
          <Text numberOfLines={1} className="mt-0.5 font-inter-regular text-sm text-muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );

  if (onPress === undefined) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}
