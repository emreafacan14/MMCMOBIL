import { Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "@/components/ui/GlassCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, appVersion } from "@/constants/theme";
import { useTranslation } from "@/i18n";

export default function AboutScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-transparent" edges={["left", "right", "bottom"]}>
      <ScreenHeader title={t("about.title")} onBack={() => router.back()} />
      <View className="flex-1 items-center justify-center px-8">
        <View
          pointerEvents="none"
          className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary-dim opacity-60"
        />
        <View
          pointerEvents="none"
          className="absolute -left-20 bottom-10 h-56 w-56 rounded-full bg-primary-dim opacity-40"
        />

        <View className="h-20 w-20 items-center justify-center rounded-[28px] border border-primary/25 bg-primary-dim">
          <Sparkles size={30} color={colors.gold} />
        </View>
        <Text className="mt-6 text-center font-inter-extrabold text-2xl tracking-tight text-ink">
          {t("about.tagline")}
        </Text>
        <Text className="mt-3 text-center text-sm leading-relaxed text-muted">
          {t("about.description")}
        </Text>

        <GlassCard className="mt-10 w-full p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted">{t("about.versionLabel")}</Text>
            <View className="rounded-full bg-primary-dim px-3 py-1">
              <Text className="font-inter-semibold text-xs text-primary-strong">
                {appVersion}
              </Text>
            </View>
          </View>
        </GlassCard>
      </View>
    </SafeAreaView>
  );
}
