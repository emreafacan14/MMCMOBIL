import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CircleAlert, Eye, EyeOff, Lock } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
  OtpInput,
  PremiumButton,
  ScreenHeader,
  TextField,
} from "@/components/ui";
import { useTranslation } from "@/i18n";
import {
  useResendForgotPasswordOtp,
  useResetPassword,
} from "@/hooks/queries/authQueries";
import { useHaptic } from "@/hooks/useHaptic";
import { toast } from "@/store/toastStore";
import { ApiError } from "@/services/client";
import {
  isSamePassword,
  isValidOtpCode,
  isValidPassword,
} from "@/utils/validators";

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * The dictionary has no dedicated weak-password key; a minimal stand-in is
 * used and reported for addition as:
 *   auth.feedback.shortPassword -> TR "Şifre en az 6 karakter olmalıdır."
 *                                  EN "Password must be at least 6 characters."
 */
const SHORT_PASSWORD_MESSAGE = "Şifre en az 6 karakter olmalıdır.";

/**
 * Service errors always surface as ApiError (client unwraps envelopes);
 * `toApiError` itself is not exported, so non-ApiError strays fall back to
 * the shared unexpected-error copy.
 */
function resolveAuthError(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

interface ResetForm {
  code: string;
  newPassword: string;
  confirmPassword: string;
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

export default function ResetPasswordScreen(): ReactElement {
  const { t } = useTranslation();
  const haptic = useHaptic();
  const reset = useResetPassword();
  const resend = useResendForgotPasswordOtp();

  const { email, verificationKey: initialVerificationKey } = useLocalSearchParams<{
    email?: string;
    verificationKey?: string;
  }>();

  const [form, setForm] = useState<ResetForm>({
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [verificationKey, setVerificationKey] = useState(
    initialVerificationKey ?? "",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [hasOtpError, setHasOtpError] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
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
  const patchForm = (values: Partial<ResetForm>): void => {
    setForm((previous) => ({ ...previous, ...values }));
  };

  const handleChangeCode = (digits: string): void => {
    patchForm({ code: digits });
    setHasOtpError(false);
  };

  const toggleShowPassword = (): void => {
    setShowPassword((previous) => !previous);
  };

  const startResendCooldown = (): void => {
    setResendInSeconds(RESEND_COOLDOWN_SECONDS);
  };

  const handleBack = (): void => {
    router.back();
  };

  const handleSubmitReset = async (): Promise<void> => {
    setServerError(null);
    setHasOtpError(false);
    setPasswordError(null);
    setConfirmError(null);

    let isInvalid = false;

    if (!isValidOtpCode(form.code)) {
      setHasOtpError(true);
      isInvalid = true;
    }

    if (!isValidPassword(form.newPassword)) {
      setPasswordError(SHORT_PASSWORD_MESSAGE);
      isInvalid = true;
    }

    if (!isSamePassword(form.newPassword, form.confirmPassword)) {
      setConfirmError(t("auth.feedback.passwordMismatch"));
      isInvalid = true;
    }

    if (isInvalid) {
      return;
    }

    try {
      await reset.mutateAsync({
        verificationKey,
        code: form.code,
        newPassword: form.newPassword,
      });
      toast.success(t("auth.feedback.resetSuccess"));
      router.replace("/(auth)/login");
    } catch (error) {
      setServerError(resolveAuthError(error, t("common.unexpectedError")));
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
        title={t("auth.reset.title")}
        subtitle={t("auth.reset.subtitle", { email })}
        onBack={handleBack}
      />
      <KeyboardAwareScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-y-5">
          <OtpInput value={form.code} onChange={handleChangeCode} hasError={hasOtpError} />

          <TextField
            label={t("auth.reset.newPasswordLabel")}
            value={form.newPassword}
            onChangeText={(newPassword) => patchForm({ newPassword })}
            icon={<Lock size={18} className="text-faint" />}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            error={passwordError}
            rightSlot={
              <Pressable onPress={toggleShowPassword} hitSlop={8}>
                {showPassword ? (
                  <EyeOff size={20} className="text-faint" />
                ) : (
                  <Eye size={20} className="text-faint" />
                )}
              </Pressable>
            }
          />
          <TextField
            label={t("auth.reset.confirmPasswordLabel")}
            value={form.confirmPassword}
            onChangeText={(confirmPassword) => patchForm({ confirmPassword })}
            icon={<Lock size={18} className="text-faint" />}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            error={confirmError}
          />

          {serverError !== null && (
            <View className="flex-row items-center gap-x-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5">
              <CircleAlert size={16} className="text-danger" />
              <Text className="flex-1 text-sm text-danger">{serverError}</Text>
            </View>
          )}

          <PremiumButton
            label={t("auth.reset.submit")}
            onPress={() => void handleSubmitReset()}
            loading={reset.isPending}
            disabled={reset.isPending}
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
