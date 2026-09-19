import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CircleAlert } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
  OtpInput,
  PremiumButton,
  ScreenHeader,
} from "@/components/ui";
import { useTranslation } from "@/i18n";
import {
  useResendEmailOtp,
  useVerifyEmail,
} from "@/hooks/queries/authQueries";
import { useHaptic } from "@/hooks/useHaptic";
import { toast } from "@/store/toastStore";
import { ApiError } from "@/services/client";
import { isValidOtpCode } from "@/utils/validators";

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Service errors always surface as ApiError (client unwraps envelopes);
 * `toApiError` itself is not exported, so non-ApiError strays fall back to
 * the shared unexpected-error copy.
 */
function resolveAuthError(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

function MissingParamsGuard({ onBack }: { onBack: () => void }): ReactElement {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-y-4 px-6">
      <CircleAlert size={28} className="text-danger" />
      <Text className="text-center font-inter-semibold text-base text-ink">
        {t("common.errorTitle")}
      </Text>
      <PremiumButton
        label={t("common.retry")}
        variant="secondary"
        onPress={onBack}
      />
    </View>
  );
}

export default function VerifyEmailScreen(): ReactElement {
  const { t } = useTranslation();
  const haptic = useHaptic();
  const verify = useVerifyEmail();
  const resend = useResendEmailOtp();

  const { email, verificationKey: initialVerificationKey } = useLocalSearchParams<{
    email?: string;
    verificationKey?: string;
  }>();

  const [code, setCode] = useState("");
  const [verificationKey, setVerificationKey] = useState(
    initialVerificationKey ?? "",
  );
  const [hasOtpError, setHasOtpError] = useState(false);
  const [resendInSeconds, setResendInSeconds] = useState(RESEND_COOLDOWN_SECONDS);

  const isCooldownActive = resendInSeconds > 0;

  useEffect(() => {
    if (!isCooldownActive) {
      return;
    }

    const intervalId: ReturnType<typeof setInterval> = setInterval(() => {
      setResendInSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isCooldownActive]);

  // Hooks above stay unconditional; the guard only short-circuits rendering.
  if (!email || !verificationKey) {
    return (
      <View className="flex-1 bg-transparent">
        <MissingParamsGuard onBack={() => router.back()} />
      </View>
    );
  }

  // Handlers live below the guard so params are narrowed to plain strings.
  const handleChangeCode = (digits: string): void => {
    setCode(digits);
    setHasOtpError(false);
  };

  const startResendCooldown = (): void => {
    setResendInSeconds(RESEND_COOLDOWN_SECONDS);
  };

  const handleBack = (): void => {
    router.back();
  };

  const handleSubmitVerify = async (): Promise<void> => {
    if (!isValidOtpCode(code)) {
      setHasOtpError(true);
      return;
    }

    try {
      await verify.mutateAsync({ verificationKey, code });
      toast.success(t("auth.verify.successMessage"));
      router.replace("/(auth)/login");
    } catch (error) {
      setHasOtpError(true);
      toast.error(resolveAuthError(error, t("common.unexpectedError")));
    }
  };

  const handleResend = async (): Promise<void> => {
    haptic("light");

    try {
      const response = await resend.mutateAsync({ email });

      if (response !== null) {
        setVerificationKey(response.verificationKey);
      }

      toast.success(t("auth.feedback.otpResent"));
      startResendCooldown();
    } catch (error) {
      toast.error(resolveAuthError(error, t("common.unexpectedError")));
    }
  };

  return (
    <View className="flex-1 bg-transparent">
      <ScreenHeader
        title={t("auth.verify.title")}
        subtitle={t("auth.verify.subtitle", { email })}
        onBack={handleBack}
      />
      <KeyboardAwareScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-y-6">
          <OtpInput value={code} onChange={handleChangeCode} hasError={hasOtpError} />

          <PremiumButton
            label={t("auth.verify.submit")}
            onPress={() => void handleSubmitVerify()}
            loading={verify.isPending}
            disabled={!isValidOtpCode(code) || verify.isPending}
          />

          {isCooldownActive ? (
            <Text className="text-center text-xs text-faint">
              {t("auth.verify.resendCooldown", { seconds: resendInSeconds })}
            </Text>
          ) : (
            <Pressable onPress={() => void handleResend()} hitSlop={6}>
              <Text className="text-center text-sm font-inter-semibold text-primary-strong">
                {t("auth.verify.resend")}
              </Text>
            </Pressable>
          )}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
