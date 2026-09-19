import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertCircle,
  CheckCircle2,
  Radio,
  Settings,
  Sparkles,
  Wifi,
  X,
} from "lucide-react-native";
import { GlassCard, PremiumButton } from "@/components/ui";
import { colors } from "@/constants/theme";
import { useHaptic } from "@/hooks/useHaptic";
import { useTranslation } from "@/i18n";
import { publicCardService } from "@/services/publicCardService";
import { nfcService, type NfcWriteStatus } from "@/services/nfcService";
import { OverlayModal } from "./parts";

interface NfcWriteModalProps {
  visible: boolean;
  urlKey: string;
  onClose: () => void;
}

export function NfcWriteModal({ visible, urlKey, onClose }: NfcWriteModalProps) {
  const { t } = useTranslation();
  const haptic = useHaptic();
  const [status, setStatus] = useState<NfcWriteStatus>("ready");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  // Animated pulse and float values
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.7)).current;

  const fullUrl = publicCardService.buildPublicWebUrl(urlKey);

  // Animation loops
  useEffect(() => {
    if (!visible) return;

    const pulse1 = Animated.loop(
      Animated.timing(pulseAnim1, {
        toValue: 1,
        duration: 2400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );

    const pulse2 = Animated.loop(
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(pulseAnim2, {
          toValue: 1,
          duration: 2400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 4,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulse1.start();
    pulse2.start();
    float.start();

    return () => {
      pulse1.stop();
      pulse2.stop();
      float.stop();
      pulseAnim1.setValue(0);
      pulseAnim2.setValue(0);
      floatAnim.setValue(0);
    };
  }, [visible, pulseAnim1, pulseAnim2, floatAnim]);

  // Spring pop on success
  useEffect(() => {
    if (status === "success") {
      Animated.spring(successScale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      successScale.setValue(0.7);
    }
  }, [status, successScale]);

  const startWriting = async () => {
    setStatus("ready");
    setErrorKey(null);

    const result = await nfcService.writeUrl(fullUrl, (newStatus, msg) => {
      setStatus(newStatus);
      if (newStatus === "error" && msg) {
        setErrorKey(msg);
      }
    });

    if (result.success) {
      haptic("success");
    } else if (status !== "idle") {
      haptic("error");
    }
  };

  useEffect(() => {
    if (visible) {
      void startWriting();
    } else {
      void nfcService.cancel();
      setStatus("ready");
      setErrorKey(null);
    }
    return () => {
      void nfcService.cancel();
    };
  }, [visible, urlKey]);

  const handleClose = () => {
    haptic("light");
    void nfcService.cancel();
    onClose();
  };

  const handleRetry = () => {
    haptic("light");
    void startWriting();
  };

  const handleOpenSettings = () => {
    haptic("light");
    void nfcService.openSettings();
  };

  const getStatusContent = () => {
    switch (status) {
      case "success":
        return {
          title: t("nfc.success"),
          hint: t("nfc.successHint"),
        };
      case "error":
        return {
          title: t("nfc.error"),
          hint:
            errorKey === "nfcNotSupported"
              ? t("nfc.notSupported")
              : errorKey === "nfcDisabled"
                ? t("nfc.disabled")
                : t("nfc.errorHint"),
        };
      case "writing":
        return {
          title: t("nfc.writing"),
          hint: t("nfc.writingHint"),
        };
      case "scanning":
      case "ready":
      default:
        return {
          title: t("nfc.ready"),
          hint: t("nfc.readyHint"),
        };
    }
  };

  const content = getStatusContent();

  const pulseScale1 = pulseAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.3],
  });
  const pulseOpacity1 = pulseAnim1.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.5, 0.2, 0],
  });

  const pulseScale2 = pulseAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });
  const pulseOpacity2 = pulseAnim2.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.45, 0.15, 0],
  });

  return (
    <OverlayModal
      visible={visible}
      onClose={handleClose}
      closeAccessibilityLabel={t("common.close")}
    >
      <GlassCard className="w-full items-center gap-4 p-6">
        {/* Header with Title and Close button */}
        <View className="w-full flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Radio size={18} color={colors.gold} strokeWidth={2} />
            <Text className="font-inter-bold text-base text-ink">
              {t("nfc.writeTitle")}
            </Text>
          </View>
          <Pressable
            onPress={handleClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("common.close")}
            className="h-8 w-8 items-center justify-center rounded-full border border-line bg-surface active:opacity-70"
          >
            <X size={16} color={colors.muted} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Floating Mini NFC Smart Card Stage */}
        <View className="my-5 h-40 w-full items-center justify-center">
          {/* Expanding wireless radar wave halos */}
          {status !== "success" && status !== "error" && (
            <>
              <Animated.View
                style={[
                  styles.wirelessHalo,
                  {
                    transform: [{ scale: pulseScale1 }],
                    opacity: pulseOpacity1,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.wirelessHalo,
                  {
                    transform: [{ scale: pulseScale2 }],
                    opacity: pulseOpacity2,
                  },
                ]}
              />
            </>
          )}

          {/* Realistic Floating NFC Smart Card */}
          <Animated.View
            style={[
              styles.miniCardWrapper,
              status === "success"
                ? { transform: [{ scale: successScale }] }
                : { transform: [{ translateY: floatAnim }] },
            ]}
          >
            <LinearGradient
              colors={
                status === "success"
                  ? ["#064E3B", "#022C22"]
                  : status === "error"
                    ? ["#7F1D1D", "#450A0A"]
                    : status === "writing"
                      ? ["#78350F", "#451A03"]
                      : ["#1E293B", "#0F172A"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.miniCard}
            >
              {/* Metallic Sheen Overlay */}
              <LinearGradient
                colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              {status === "success" ? (
                <View className="flex-1 items-center justify-center">
                  <View className="relative items-center justify-center">
                    <CheckCircle2 size={38} color="#34D399" strokeWidth={2.4} />
                    <View className="absolute -top-1.5 -right-2">
                      <Sparkles size={16} color={colors.gold} />
                    </View>
                  </View>
                  <Text className="mt-1 font-inter-bold text-[11px] uppercase tracking-wider text-emerald-300">
                    KART HAZIR
                  </Text>
                </View>
              ) : status === "error" ? (
                <View className="flex-1 items-center justify-center">
                  <AlertCircle size={38} color="#F87171" strokeWidth={2.4} />
                  <Text className="mt-1 font-inter-bold text-[11px] uppercase tracking-wider text-rose-300">
                    HATA OLUŞTU
                  </Text>
                </View>
              ) : status === "writing" ? (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size="small" color={colors.gold} />
                  <Text className="mt-2 font-inter-semibold text-[11px] uppercase tracking-wider text-amber-300">
                    YAZILIYOR...
                  </Text>
                </View>
              ) : (
                <View className="flex-1 justify-between p-3">
                  {/* Top Row: Mini Chip and Contactless Wave */}
                  <View className="flex-row items-center justify-between">
                    {/* Golden Contactless Chip */}
                    <View style={styles.miniChip}>
                      <View style={styles.chipLineH} />
                      <View style={styles.chipLineV} />
                    </View>

                    {/* Wireless Icon */}
                    <View className="flex-row items-center gap-1">
                      <Wifi
                        size={18}
                        color={colors.primaryStrong}
                        style={{ transform: [{ rotate: "90deg" }] }}
                      />
                    </View>
                  </View>

                  {/* Bottom Row: Logo and NFC indicator */}
                  <View className="flex-row items-center justify-between">
                    <Text className="font-inter-extrabold text-[12px] tracking-widest text-white/90">
                      MMCARD
                    </Text>
                    <Text className="font-inter-semibold text-[9px] uppercase tracking-wider text-primary-strong">
                      NFC TAG
                    </Text>
                  </View>
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Status Texts */}
        <View className="items-center gap-1.5 px-3">
          <Text className="text-center font-inter-bold text-lg text-ink">
            {content.title}
          </Text>
          <Text className="text-center text-xs leading-relaxed text-muted">
            {content.hint}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="w-full gap-2.5 pt-3">
          {status === "success" ? (
            <PremiumButton
              label={t("nfc.done")}
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleClose}
            />
          ) : status === "error" ? (
            <>
              {errorKey === "nfcDisabled" && (
                <PremiumButton
                  label={t("nfc.openSettings")}
                  icon={<Settings size={18} color={colors.ink} />}
                  variant="secondary"
                  size="md"
                  fullWidth
                  onPress={handleOpenSettings}
                />
              )}
              <PremiumButton
                label={t("nfc.retry")}
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleRetry}
              />
              <PremiumButton
                label={t("nfc.cancel")}
                variant="ghost"
                size="md"
                fullWidth
                onPress={handleClose}
              />
            </>
          ) : (
            <PremiumButton
              label={t("nfc.cancel")}
              variant="ghost"
              size="md"
              fullWidth
              onPress={handleClose}
            />
          )}
        </View>
      </GlassCard>
    </OverlayModal>
  );
}

const styles = StyleSheet.create({
  wirelessHalo: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.65)",
    backgroundColor: "rgba(56, 189, 248, 0.06)",
  },
  miniCardWrapper: {
    width: 154,
    height: 98,
    borderRadius: 14,
    shadowColor: colors.primaryStrong,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  miniCard: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  miniChip: {
    width: 22,
    height: 16,
    borderRadius: 3,
    backgroundColor: "rgba(245, 158, 11, 0.85)",
    borderWidth: 0.8,
    borderColor: "rgba(251, 191, 36, 0.9)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  chipLineH: {
    position: "absolute",
    width: "100%",
    height: 0.8,
    backgroundColor: "rgba(120, 53, 15, 0.6)",
  },
  chipLineV: {
    position: "absolute",
    height: "100%",
    width: 0.8,
    backgroundColor: "rgba(120, 53, 15, 0.6)",
  },
});
