import { BlurView } from "expo-blur";
import { AlertCircle, CheckCircle2, Info, type LucideIcon } from "lucide-react-native";
import { useEffect, type ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";
import { useHaptic } from "@/hooks/useHaptic";
import { useToastStore, type ToastKind } from "@/store/toastStore";

const TOAST_AUTO_DISMISS_MS = 2800;

interface KindTokens {
  border: string;
  wash: string;
  iconColor: string;
  Icon: LucideIcon;
}

const KIND_TOKENS: Record<ToastKind, KindTokens> = {
  success: {
    border: "border-success/40",
    wash: "bg-success/15",
    iconColor: colors.success,
    Icon: CheckCircle2,
  },
  error: {
    border: "border-danger/40",
    wash: "bg-danger/15",
    iconColor: colors.danger,
    Icon: AlertCircle,
  },
  info: {
    border: "border-primary-strong/40",
    wash: "bg-primary-strong/15",
    iconColor: colors.primaryStrong,
    Icon: Info,
  },
};

/**
 * Global toast banner mounted once at the app root. Renders nothing while no
 * toast is active; auto-dismisses after 2.8s or on tap.
 */
export function ToastHost(): ReactElement | null {
  const toast = useToastStore((state) => state.toast);
  const dismiss = useToastStore((state) => state.dismiss);
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();

  useEffect(() => {
    if (toast === null) {
      return undefined;
    }
    const timer = setTimeout(dismiss, TOAST_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast, dismiss]);

  if (toast === null) {
    return null;
  }

  const tokens = KIND_TOKENS[toast.kind];
  const ToastIcon = tokens.Icon;

  const handleDismiss = (): void => {
    haptic("light");
    dismiss();
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { top: insets.top + 8 }]}
    >
      <Animated.View
        key={toast.id}
        entering={FadeInDown.springify().damping(16).stiffness(200)}
        exiting={FadeOutUp}
      >
        <Pressable
          onPress={handleDismiss}
          className={`overflow-hidden rounded-2xl border bg-elevated ${tokens.border}`}
        >
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={StyleSheet.absoluteFill} className={tokens.wash} />
          <View className="flex-row items-center gap-3 px-4 py-3.5">
            <ToastIcon size={20} color={tokens.iconColor} />
            <Text numberOfLines={3} className="flex-shrink font-inter-medium text-sm text-ink">
              {toast.message}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 999,
  },
});
