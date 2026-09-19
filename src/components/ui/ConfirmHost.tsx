import type { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { GlassCard } from "./GlassCard";
import { PremiumButton } from "./PremiumButton";
import { useTranslation } from "@/i18n";
import { useConfirmStore } from "@/store/confirmStore";

/**
 * Global confirmation dialog mounted once at the app root (next to
 * ToastHost). Screens raise one via `confirmDialog.show(...)`; the cancel
 * label is standardized app-wide, so callers only pass title/message/
 * confirmLabel/tone/onConfirm. Renders nothing while no request is open.
 */
export function ConfirmHost(): ReactElement | null {
  const { t } = useTranslation();
  const request = useConfirmStore((state) => state.request);
  const dismiss = useConfirmStore((state) => state.dismiss);

  if (request === null) {
    return null;
  }

  const handleCancel = (): void => {
    dismiss();
  };

  const handleConfirm = (): void => {
    const { onConfirm } = request;
    // Close first so page-level busy states/toasts take over right away.
    dismiss();
    onConfirm();
  };

  return (
    <View className="absolute inset-0 z-50">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("common.cancel")}
        onPress={handleCancel}
        className="absolute inset-0 bg-black/70"
      />
      <View
        pointerEvents="box-none"
        className="absolute inset-0 items-center justify-center px-6"
      >
        <Animated.View
          key={request.id}
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(140)}
          className="w-full"
        >
          <GlassCard className="w-full gap-3 p-6">
            <Text className="font-inter-bold text-lg text-ink">
              {request.title}
            </Text>
            <Text className="text-sm leading-5 text-muted">
              {request.message}
            </Text>
            <View className="mt-2 gap-2">
              <PremiumButton
                label={request.confirmLabel}
                variant={request.tone === "danger" ? "danger" : "primary"}
                onPress={handleConfirm}
              />
              <PremiumButton
                label={t("common.cancel")}
                variant="ghost"
                onPress={handleCancel}
              />
            </View>
          </GlassCard>
        </Animated.View>
      </View>
    </View>
  );
}
