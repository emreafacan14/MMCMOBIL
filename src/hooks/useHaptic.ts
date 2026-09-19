import * as Haptics from "expo-haptics";

export type HapticStyle =
  | "light"
  | "medium"
  | "selection"
  | "success"
  | "warning"
  | "error";

/** Fire-and-forget haptic feedback; failures are silently ignored because a
 *  missing vibration motor must never break an interaction. */
export function useHaptic(): (style: HapticStyle) => void {
  return (style) => {
    switch (style) {
      case "light":
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        break;
      case "medium":
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        break;
      case "selection":
        void Haptics.selectionAsync().catch(() => {});
        break;
      case "success":
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        break;
      case "warning":
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        break;
      case "error":
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        break;
    }
  };
}
