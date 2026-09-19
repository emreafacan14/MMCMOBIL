import { useState } from "react";
import type { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { CircleAlert, Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AuthHero,
  GlassCard,
  PremiumButton,
  TextField,
} from "@/components/ui";
import { useTranslation } from "@/i18n";
import { toast } from "@/store/toastStore";
import { useRegister } from "@/hooks/queries/authQueries";
import { useHaptic } from "@/hooks/useHaptic";
import { ApiError } from "@/services/client";
import {
  isSamePassword,
  isValidEmail,
  isValidPassword,
} from "@/utils/validators";
import { colors } from "@/constants/theme";

/**
 * The dictionary lacks validation-message keys; minimal stand-ins are used
 * and reported for addition as:
 *   auth.feedback.requiredField -> TR "Bu alan zorunludur."
 *                                  EN "This field is required."
 *   auth.feedback.invalidEmail  -> TR "Geçerli bir e-posta adresi girin."
 *                                  EN "Enter a valid e-mail address."
 *   auth.feedback.shortPassword -> TR "Şifre en az 6 karakter olmalıdır."
 *                                  EN "Password must be at least 6 characters."
 */
const REQUIRED_FIELD_MESSAGE = "Bu alan zorunludur.";
const INVALID_EMAIL_MESSAGE = "Geçerli bir e-posta adresi girin.";
const SHORT_PASSWORD_MESSAGE = "Şifre en az 6 karakter olmalıdır.";

/**
 * Service errors always surface as ApiError (client unwraps envelopes);
 * `toApiError` itself is not exported, so non-ApiError strays fall back to
 * the shared unexpected-error copy.
 */
function resolveAuthError(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

interface RegisterForm {
  name: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type RegisterFieldKey = keyof RegisterForm;

function validateRegisterForm(
  form: RegisterForm,
  mismatchMessage: string,
): Partial<Record<RegisterFieldKey, string>> | null {
  const errors: Partial<Record<RegisterFieldKey, string>> = {};

  if (form.name.trim().length === 0) {
    errors.name = REQUIRED_FIELD_MESSAGE;
  }

  if (form.surname.trim().length === 0) {
    errors.surname = REQUIRED_FIELD_MESSAGE;
  }

  if (!isValidEmail(form.email)) {
    errors.email = INVALID_EMAIL_MESSAGE;
  }

  if (!isValidPassword(form.password)) {
    errors.password = SHORT_PASSWORD_MESSAGE;
  }

  if (!isSamePassword(form.password, form.confirmPassword)) {
    errors.confirmPassword = mismatchMessage;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export default function RegisterScreen(): ReactElement {
  const { t } = useTranslation();
  const haptic = useHaptic();
  const register = useRegister();

  const [form, setForm] = useState<RegisterForm>({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<RegisterFieldKey, string>> | null
  >(null);
  const [serverError, setServerError] = useState<string | null>(null);

  function patchForm(values: Partial<RegisterForm>): void {
    setForm((previous) => ({ ...previous, ...values }));
  }

  function toggleShowPassword(): void {
    haptic("light");
    setShowPassword((previous) => !previous);
  }

  function handleGoToLogin(): void {
    haptic("light");
    router.replace("/(auth)/login");
  }

  async function handleSubmitRegister(): Promise<void> {
    setServerError(null);

    const validation = validateRegisterForm(
      form,
      t("auth.feedback.passwordMismatch"),
    );
    setFieldErrors(validation);

    if (validation !== null) {
      return;
    }

    const name = form.name.trim();
    const surname = form.surname.trim();
    const email = form.email.trim();

    try {
      // RegisterResponse always carries a verificationKey.
      const response = await register.mutateAsync({
        name,
        surname,
        email,
        password: form.password,
      });

      toast.success(t("auth.feedback.registerSuccess"));
      router.push({
        pathname: "/(auth)/verify-email",
        params: { email, verificationKey: response.verificationKey },
      });
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
          title={t("auth.register.title")}
          subtitle={t("auth.register.subtitle")}
          compact
        />

        <GlassCard className="p-5">
          <View className="gap-y-4">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextField
                  label={t("auth.register.nameLabel")}
                  value={form.name}
                  onChangeText={(name) => patchForm({ name })}
                  icon={<User size={18} color={colors.faint} />}
                  autoCapitalize="words"
                  error={fieldErrors?.name ?? null}
                />
              </View>
              <View className="flex-1">
                <TextField
                  label={t("auth.register.surnameLabel")}
                  value={form.surname}
                  onChangeText={(surname) => patchForm({ surname })}
                  icon={<User size={18} color={colors.faint} />}
                  autoCapitalize="words"
                  error={fieldErrors?.surname ?? null}
                />
              </View>
            </View>
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
              autoCapitalize="none"
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
            <TextField
              label={t("auth.register.confirmPasswordLabel")}
              value={form.confirmPassword}
              onChangeText={(confirmPassword) => patchForm({ confirmPassword })}
              icon={<Lock size={18} color={colors.faint} />}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              error={fieldErrors?.confirmPassword ?? null}
            />

            {serverError !== null && (
              <View className="flex-row items-center gap-x-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5">
                <CircleAlert size={16} color={colors.danger} />
                <Text className="flex-1 text-sm text-danger">{serverError}</Text>
              </View>
            )}

            <PremiumButton
              label={t("auth.register.submit")}
              onPress={() => void handleSubmitRegister()}
              loading={register.isPending}
              disabled={register.isPending}
            />

            <Text className="text-center text-xs text-faint">
              {t("auth.register.terms")}
            </Text>
          </View>
        </GlassCard>

        <View className="mt-6 flex-row items-center justify-center gap-x-1">
          <Text className="text-sm text-muted">{t("auth.register.haveAccount")}</Text>
          <Pressable onPress={handleGoToLogin} hitSlop={6}>
            <Text className="text-sm font-inter-semibold text-primary-strong">
              {t("auth.register.loginCta")}
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
