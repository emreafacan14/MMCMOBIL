import type { ReactElement } from "react";
import { Text, View } from "react-native";

export interface StatusBadgeProps {
  isActive: boolean;
  isRevoked: boolean;
  activeLabel: string;
  pendingLabel: string;
  revokedLabel: string;
}

/**
 * Status pill for card lifecycle states. Wording comes from the caller via
 * the label props so screens stay in control of i18n.
 */
export function StatusBadge({
  isActive,
  isRevoked,
  activeLabel,
  pendingLabel,
  revokedLabel,
}: StatusBadgeProps): ReactElement {
  const isActiveState = isActive && !isRevoked;

  const paletteClass = isRevoked
    ? "border-danger/25 bg-danger/10"
    : isActiveState
      ? "border-success/25 bg-success/10"
      : "border-warning/25 bg-warning/10";
  const textClass = isRevoked
    ? "text-danger"
    : isActiveState
      ? "text-success"
      : "text-warning";
  const label = isRevoked ? revokedLabel : isActiveState ? activeLabel : pendingLabel;

  return (
    <View className={`self-start rounded-full border px-2.5 py-1 ${paletteClass}`}>
      <Text className={`font-inter-bold text-[11px] uppercase tracking-widest ${textClass}`}>
        {label}
      </Text>
    </View>
  );
}
