import { CheckCircle2, Mail, MessageSquare, Phone, Send, User } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { TextField } from "@/components/ui/TextField";
import { KeyboardActionBar } from "@/components/ui/KeyboardActionBar";
import { colors } from "@/constants/theme";
import { useHaptic } from "@/hooks/useHaptic";
import { useSendContactMessage } from "@/hooks/queries/supportQueries";
import { useTranslation } from "@/i18n";
import { toast } from "@/store/toastStore";
import { toApiError } from "@/services/client";
import type { CreateContactRequest } from "@/types/api";
import { isValidEmail, isValidTurkishMobile } from "@/utils/validators";

/** Backend rule: the message must be at least this many characters. */
const SUPPORT_MIN_MESSAGE_LENGTH = 10;

interface SupportFormState {
  readonly fullName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly message: string;
}

const INITIAL_FORM: SupportFormState = {
  fullName: "",
  email: "",
  phoneNumber: "",
  message: "",
};

export default function SupportScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const haptic = useHaptic();
  const sendMutation = useSendContactMessage();

  const [form, setForm] = useState<SupportFormState>(INITIAL_FORM);
  const [isSent, setIsSent] = useState(false);

  const updateField = (patch: Partial<SupportFormState>) => {
    setForm((previous) => ({ ...previous, ...patch }));
  };

  const handleSubmit = async () => {
    const cleanedPhoneNumber = form.phoneNumber.replace(/\D/g, "");
    const trimmedMessage = form.message.trim();
    const isValid =
      form.fullName.trim().length > 0 &&
      isValidEmail(form.email) &&
      isValidTurkishMobile(cleanedPhoneNumber) &&
      trimmedMessage.length >= SUPPORT_MIN_MESSAGE_LENGTH;

    if (!isValid) {
      haptic("error");
      toast.error(t("common.errorTitle"));
      return;
    }

    const request: CreateContactRequest = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phoneNumber: cleanedPhoneNumber,
      message: trimmedMessage,
    };

    try {
      await sendMutation.mutateAsync(request);
      haptic("success");
      setIsSent(true);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  if (isSent) {
    return (
      <SafeAreaView className="flex-1 bg-transparent">
        <View className="flex-1 items-center justify-center gap-y-4 px-8">
          <CheckCircle2 size={56} color={colors.success} />
          <Text className="text-center font-inter-bold text-xl text-ink">
            {t("support.successTitle")}
          </Text>
          <Text className="text-center text-sm leading-relaxed text-muted">
            {t("support.successDescription")}
          </Text>
          <View className="mt-4 w-full">
            <PremiumButton
              label={t("common.done")}
              onPress={() => router.back()}
              size="lg"
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-transparent" edges={["left", "right"]}>
      <ScreenHeader
        large
        title={t("support.title")}
        subtitle={t("support.subtitle")}
        onBack={() => router.back()}
      />
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 24,
          rowGap: 16,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <GlassCard className="p-4">
          <View className="gap-y-4">
            <TextField
              label={t("support.nameLabel")}
              value={form.fullName}
              onChangeText={(fullName) => updateField({ fullName })}
              placeholder={t("support.nameLabel")}
              icon={<User size={18} color={colors.faint} />}
            />
            <TextField
              label={t("support.emailLabel")}
              value={form.email}
              onChangeText={(email) => updateField({ email })}
              placeholder="ornek@mmcard.com"
              icon={<Mail size={18} color={colors.faint} />}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextField
              label={t("support.phoneLabel")}
              value={form.phoneNumber}
              onChangeText={(phoneNumber) => updateField({ phoneNumber })}
              placeholder="5XXXXXXXXX"
              hint={t("support.phoneHint")}
              icon={<Phone size={18} color={colors.faint} />}
              keyboardType="phone-pad"
              autoCorrect={false}
            />
            <TextField
              label={t("support.messageLabel")}
              value={form.message}
              onChangeText={(message) => updateField({ message })}
              placeholder={t("support.messagePlaceholder")}
              icon={<MessageSquare size={18} color={colors.faint} />}
              multiline
            />
          </View>
        </GlassCard>
      </KeyboardAwareScrollView>
      <KeyboardActionBar>
        <PremiumButton
          label={t("support.submit")}
          icon={<Send size={18} color="#FFFFFF" />}
          onPress={() => void handleSubmit()}
          loading={sendMutation.isPending}
          size="lg"
          fullWidth
        />
      </KeyboardActionBar>
    </SafeAreaView>
  );
}
