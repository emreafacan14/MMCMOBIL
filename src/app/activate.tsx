/**
 * Card activation: enter the code printed on a physical card to claim it.
 * On success the backend returns the activated card summary.
 */

import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  KeyboardAwareScrollView,
} from "react-native-keyboard-controller";
import { BadgeCheck, CheckCircle2 } from "lucide-react-native";
import { useTranslation } from "@/i18n";
import {
  KeyboardActionBar,
  PremiumButton,
  ScreenHeader,
} from "@/components/ui";
import { useHaptic } from "@/hooks/useHaptic";
import { useActivateCard } from "@/hooks/queries/cardQueries";
import {
  apiErrorMessage,
  buttonIcon,
  BUTTON_ICON_COLOR,
  PALETTE,
} from "@/components/card/parts";
import { toast } from "@/store/toastStore";
import type { CardSummary } from "@/types/api";

function ActivationSuccessView({
  onGoToCard,
  onAddAnother,
}: {
  onGoToCard: () => void;
  onAddAnother: () => void;
}) {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <View className="flex-1 items-center justify-center px-5">
        <CheckCircle2 size={64} color={PALETTE.success} strokeWidth={1.75} />
        <Text className="mt-5 text-center font-inter-bold text-2xl text-ink">
          {t("activate.successTitle")}
        </Text>
        <Text className="mt-2 text-center text-muted">
          {t("activate.successDescription")}
        </Text>
        <View className="mt-8 w-full gap-3">
          <PremiumButton
            label={t("activate.goToCard")}
            variant="primary"
            fullWidth
            onPress={onGoToCard}
          />
          <PremiumButton
            label={t("activate.addAnother")}
            variant="secondary"
            fullWidth
            onPress={onAddAnother}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function ActivateCardScreen() {
  const { t } = useTranslation();
  const haptic = useHaptic();
  const activateCard = useActivateCard();

  const [code, setCode] = useState("");
  const [activatedCard, setActivatedCard] = useState<CardSummary | null>(null);

  const trimmedCode = code.trim();
  const isCodeFilled = trimmedCode.length > 0;

  const handleActivate = async (): Promise<void> => {
    try {
      const summary = await activateCard.mutateAsync({ urlKey: trimmedCode });
      haptic("success");
      setActivatedCard(summary);
    } catch (error) {
      haptic("error");
      toast.error(apiErrorMessage(error) ?? t("common.unexpectedError"));
    }
  };

  const handleGoToCard = () => {
    if (activatedCard === null) {
      return;
    }

    router.replace(`/(tabs)/cards?cardId=${activatedCard.id}`);
  };

  const handleAddAnother = () => {
    haptic("light");
    setActivatedCard(null);
    setCode("");
  };

  if (activatedCard !== null) {
    return (
      <ActivationSuccessView
        onGoToCard={handleGoToCard}
        onAddAnother={handleAddAnother}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-transparent" edges={["left", "right"]}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={t("activate.title")}
          subtitle={t("activate.subtitle")}
          large
          inset={false}
          onBack={() => router.back()}
        />

        <View className="mt-6">
          <Text className="mb-2 font-inter-medium text-sm text-muted">
            {t("activate.codeLabel")}
          </Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder={t("activate.codePlaceholder")}
            placeholderTextColor={PALETTE.faint}
            autoCapitalize="characters"
            autoCorrect={false}
            autoComplete="off"
            returnKeyType="done"
            onSubmitEditing={() => {
              if (isCodeFilled) {
                void handleActivate();
              }
            }}
            className="rounded-2xl border border-line bg-elevated/80 px-4 py-4 font-inter-semibold tracking-widest text-base text-ink"
          />
        </View>
      </KeyboardAwareScrollView>

      <KeyboardActionBar>
        <PremiumButton
          label={t("activate.submit")}
          icon={buttonIcon(BadgeCheck, BUTTON_ICON_COLOR.primary)}
          variant="primary"
          size="lg"
          fullWidth
          loading={activateCard.isPending}
          disabled={!isCodeFilled}
          onPress={() => {
            void handleActivate();
          }}
        />
      </KeyboardActionBar>
    </SafeAreaView>
  );
}
