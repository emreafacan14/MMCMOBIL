import { useState } from "react";
import type { ReactElement } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { CircleAlert, KeyRound, Mail, Send } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { TextField } from "@/components/ui/TextField";
import { AuthHero } from "@/components/ui/AuthHero";
import { useTranslation } from "@/i18n";
import { useForgotPassword } from "@/hooks/queries/authQueries";
import { toast } from "@/store/toastStore";
import { ApiError } from "@/services/client";
import { isValidEmail } from "@/utils/validators";
import { colors } from "@/constants/theme";

/**
 * The dictionary has no dedicated invalid-e-mail key; a minimal stand-in is
 * used and reported for addition as:
 *   auth.feedback.invalidEmail -> TR "Geçerli bir e-posta adresi girin."
 *                                 EN "Enter a valid e-mail address."
 */
const INVALID_EMAIL_MESSAGE = "Geçerli bir e-posta adresi girin.";
const WITHHELD_VERIFICATION_KEY = "0".repeat(64);

/**
 * Service errors always surface as ApiError (client unwraps envelopes);
 * `toApiError` itself is not exported, so non-ApiError strays fall back to
 * the shared unexpected-error copy.
 */
function resolveAuthError(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

interface ForgotForm {
  email: string;
}

export default function ForgotPasswordScreen(): ReactElement {
  const { t } = useTranslation();
  const forgot = useForgotPassword();

  const [form, setForm] = useState<ForgotForm>({ email: "" });
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmitForgot = async (): Promise<void> => {
    setServerError(null);
    setFieldError(null);

    if (!isValidEmail(form.email)) {
      setFieldError(INVALID_EMAIL_MESSAGE);
      return;
    }

    const email = form.email.trim();

    try {
      const response = await forgot.mutateAsync({ email });

      toast.success(t("auth.feedback.otpResent"));
      router.push({
        pathname: "/(auth)/reset-password",
        // The backend intentionally returns null for unknown e-mails. Use an
        // opaque invalid key so navigation does not reveal account existence.
        params: {
          email,
          verificationKey:
            response?.verificationKey ?? WITHHELD_VERIFICATION_KEY,
        },
      });
    } catch (error) {
      setServerError(resolveAuthError(error, t("common.unexpectedError")));
    }
  };

  return (
    <View className="flex-1 bg-transparent">
      <ScreenHeader
        title="MMCard"
        onBack={() => router.back()}
      />
      <KeyboardAwareScrollView
        className="flex-1 px-6"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingTop: 20,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHero
          title={t("auth.forgot.title")}
          subtitle={t("auth.forgot.subtitle")}
          icon={KeyRound}
          compact
        />

        <GlassCard className="p-5">
          <View className="gap-y-4">
            <TextField
              label={t("auth.forgot.emailLabel")}
              value={form.email}
              onChangeText={(email) => {
                setForm({ email });
                setFieldError(null);
              }}
              icon={<Mail size={18} color={colors.faint} />}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={fieldError}
            />

            {serverError !== null && (
              <View className="flex-row items-center gap-x-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5">
                <CircleAlert size={16} color={colors.danger} />
                <Text className="flex-1 text-sm text-danger">{serverError}</Text>
              </View>
            )}

            <PremiumButton
              label={t("auth.forgot.submit")}
              icon={<Send size={18} color="#FFFFFF" />}
              onPress={() => void handleSubmitForgot()}
              loading={forgot.isPending}
              disabled={forgot.isPending}
            />
          </View>
        </GlassCard>
      </KeyboardAwareScrollView>
    </View>
  );
}
