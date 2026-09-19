import { useState } from "react";
import type { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { CircleAlert, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AuthHero,
  GlassCard,
  PremiumButton,
  TextField,
} from "@/components/ui";
import { useTranslation } from "@/i18n";
import { useLogin } from "@/hooks/queries/authQueries";
import { useHaptic } from "@/hooks/useHaptic";
import { ApiError } from "@/services/client";
import { isValidEmail, isValidPassword } from "@/utils/validators";
import { colors } from "@/constants/theme";

/**
 * The dictionary has no dedicated validation-message keys yet; minimal
 * stand-ins are used and reported for addition as:
 *   auth.feedback.invalidEmail  -> TR "Geçerli bir e-posta adresi girin."
 *                                  EN "Enter a valid e-mail address."
 *   auth.feedback.shortPassword -> TR "Şifre en az 6 karakter olmalıdır."
 *                                  EN "Password must be at least 6 characters."
 */
const INVALID_EMAIL_MESSAGE = "Geçerli bir e-posta adresi girin.";
const SHORT_PASSWORD_MESSAGE = "Şifre en az 6 karakter olmalıdır.";

interface LoginForm {
  email: string;
  password: string;
}

interface LoginFieldErrors {
  email?: string;
  password?: string;
}

/**
 * Service errors always surface as ApiError (client unwraps envelopes);
 * `toApiError` itself is not exported, so non-ApiError strays fall back to
 * the shared unexpected-error copy.
 */
function resolveAuthError(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

function validateLoginForm(form: LoginForm): LoginFieldErrors | null {
  const errors: LoginFieldErrors = {};

  if (!isValidEmail(form.email)) {
    errors.email = INVALID_EMAIL_MESSAGE;
  }

  if (!isValidPassword(form.password)) {
    errors.password = SHORT_PASSWORD_MESSAGE;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export default function LoginScreen(): ReactElement {
  const { t } = useTranslation();
  const haptic = useHaptic();
  const login = useLogin();

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  function patchForm(values: Partial<LoginForm>): void {
    setForm((previous) => ({ ...previous, ...values }));
  }

  function toggleShowPassword(): void {
    haptic("light");
    setShowPassword((previous) => !previous);
  }

  function handleGoToRegister(): void {
    haptic("light");
    router.replace("/(auth)/register");
  }

  function handleGoToForgotPassword(): void {
    haptic("light");
    router.push("/(auth)/forgot-password");
  }

  async function handleSubmitLogin(): Promise<void> {
    setServerError(null);

    const validation = validateLoginForm(form);
    setFieldErrors(validation);

    if (validation !== null) {
      return;
    }

    const email = form.email.trim();

    try {
      const response = await login.mutateAsync({
        email,
        password: form.password,
      });

      if (response.requiresEmailVerification && response.verificationKey !== null) {
        router.push({
          pathname: "/(auth)/verify-email",
          params: { email, verificationKey: response.verificationKey },
        });
        return;
      }

      // Session is already persisted by useLogin's onSuccess when tokens exist.
      router.replace("/(tabs)");
    } catch (error) {
      setServerError(resolveAuthError(error, t("common.unexpectedError")));
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <KeyboardAwareScrollView
        className="flex-1 px-6"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingTop: 28,
          paddingBottom: 36,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHero
          title={t("auth.login.title")}
          subtitle={t("auth.login.subtitle")}
        />

        <GlassCard className="p-5">
          <View className="gap-y-4">
            <TextField
              label={t("auth.login.emailLabel")}
              value={form.email}
              onChangeText={(email) => patchForm({ email })}
              icon={<Mail size={18} color={colors.faint} />}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={fieldErrors?.email ?? null}
            />
            <TextField
              label={t("auth.login.passwordLabel")}
              value={form.password}
              onChangeText={(password) => patchForm({ password })}
              icon={<Lock size={18} color={colors.faint} />}
              secureTextEntry={!showPassword}
              error={fieldErrors?.password ?? null}
              rightSlot={
                <Pressable onPress={toggleShowPassword} hitSlop={8}>
                  {showPassword ? (
                    <EyeOff size={20} color={colors.faint} />
                  ) : (
                    <Eye size={20} color={colors.faint} />
                  )}
                </Pressable>
              }
            />

            {serverError !== null && (
              <View className="flex-row items-center gap-x-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5">
                <CircleAlert size={16} color={colors.danger} />
                <Text className="flex-1 text-sm text-danger">{serverError}</Text>
              </View>
            )}

            <Pressable
              className="self-end rounded-xl bg-primary-dim px-3 py-2"
              onPress={handleGoToForgotPassword}
              hitSlop={6}
            >
              <Text className="text-xs font-inter-semibold text-primary-strong">
                {t("auth.login.forgotPassword")}
              </Text>
            </Pressable>

            <PremiumButton
              label={t("auth.login.submit")}
              onPress={() => void handleSubmitLogin()}
              loading={login.isPending}
              disabled={login.isPending}
            />
          </View>
        </GlassCard>

        <View className="mt-6 flex-row items-center justify-center gap-x-1">
          <Text className="text-sm text-muted">{t("auth.login.noAccount")}</Text>
          <Pressable onPress={handleGoToRegister} hitSlop={6}>
            <Text className="text-sm font-inter-semibold text-primary-strong">
              {t("auth.login.registerCta")}
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
