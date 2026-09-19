import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Info,
  LifeBuoy,
  LogOut,
  Share2,
  User,
  type LucideIcon,
} from "lucide-react-native";

import { Avatar, GlassCard, ScreenHeader, Skeleton } from "@/components/ui";
import { appVersion, colors } from "@/constants/theme";
import { useHaptic } from "@/hooks/useHaptic";
import { useLogout } from "@/hooks/queries/authQueries";
import { useMyProfile } from "@/hooks/queries/profileQueries";
import { useTranslation, type TranslationKey } from "@/i18n";
import { useAuthStore } from "@/store/authStore";
import { confirmDialog } from "@/store/confirmStore";
import { useSettingsStore, type Language } from "@/store/settingsStore";
import { shareApp } from "@/utils/appSharing";

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  danger?: boolean;
  onPress: () => void;
}

function SettingsRow({
  icon: Icon,
  label,
  description,
  danger = false,
  onPress,
}: SettingsRowProps) {
  const haptic = useHaptic();
  const accentColor = danger ? colors.danger : colors.muted;

  const handlePress = () => {
    haptic("light");
    onPress();
  };

  return (
    <Pressable
      className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-70"
      onPress={handlePress}
    >
      <View className="h-10 w-10 items-center justify-center rounded-2xl border border-line bg-surface-strong">
        <Icon size={20} color={accentColor} strokeWidth={1.8} />
      </View>
      <View className="flex-1">
        <Text
          className={`font-inter-medium text-[15px] ${
            danger ? "text-danger" : "text-ink"
          }`}
        >
          {label}
        </Text>
        {description !== undefined && (
          <Text className="mt-0.5 text-xs text-faint">{description}</Text>
        )}
      </View>
      <ChevronRight size={18} color={colors.faint} strokeWidth={1.8} />
    </Pressable>
  );
}

const LANGUAGE_LABELS: Record<Language, TranslationKey> = {
  tr: "settings.turkish",
  en: "settings.english",
};

function LanguageSegmentedControl() {
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const { t } = useTranslation();
  const haptic = useHaptic();

  const handleSelect = (next: Language) => () => {
    haptic("selection");
    setLanguage(next);
  };

  return (
    <View className="flex-row rounded-2xl border border-line bg-elevated/80 p-1">
      {(Object.keys(LANGUAGE_LABELS) as Language[]).map((code) => {
        const isActive = language === code;
        return (
          <Pressable
            key={code}
            onPress={handleSelect(code)}
            className={`rounded-xl px-4 py-1.5 ${isActive ? "bg-primary" : ""}`}
          >
            <Text
              className={`text-xs ${
                isActive
                  ? "font-inter-semibold text-white"
                  : "font-inter-medium text-muted"
              }`}
            >
              {t(LANGUAGE_LABELS[code])}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const haptic = useHaptic();
  const logout = useLogout();
  const profileQuery = useMyProfile();
  const sessionUser = useAuthStore((state) => state.user);

  const givenName = profileQuery.data?.name ?? sessionUser?.name ?? "";
  const familyName = profileQuery.data?.surname ?? sessionUser?.surname ?? "";
  const displayName = `${givenName} ${familyName}`.trim();
  const displayEmail =
    profileQuery.data?.email ?? sessionUser?.email ?? "";

  const handleOpenAccount = () => {
    haptic("light");
    router.push("/account");
  };

  const handleLogoutConfirm = () => {
    // The hook clears the session + query cache in onSettled (even on API failure).
    logout.mutate(undefined, {
      onSettled: () => router.replace("/(auth)/login"),
    });
  };

  const handleLogout = () => {
    haptic("medium");
    confirmDialog.show({
      title: t("settings.logoutConfirmTitle"),
      message: t("settings.logoutConfirmMessage"),
      confirmLabel: t("settings.logout"),
      tone: "danger",
      onConfirm: handleLogoutConfirm,
    });
  };

  return (
    <View className="flex-1 bg-transparent">
      <ScreenHeader large title={t("settings.title")} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 128,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("settings.account")}
            onPress={handleOpenAccount}
            className="active:opacity-70"
          >
            <GlassCard>
              {profileQuery.isLoading ? (
                <View className="flex-row items-center gap-3 px-4 py-3.5">
                  <Skeleton className="h-[52px] w-[52px] rounded-full" />
                  <View className="flex-1 gap-2">
                    <Skeleton className="h-4 w-36 rounded-md" />
                    <Skeleton className="h-3 w-48 rounded-md" />
                  </View>
                </View>
              ) : (
                <View className="flex-row items-center gap-3 px-4 py-3.5">
                  <Avatar
                    imagePath={profileQuery.data?.profileImagePath ?? null}
                    name={givenName}
                    surname={familyName}
                    size={52}
                  />
                  <View className="mr-3 flex-1">
                    <Text
                      numberOfLines={1}
                      className="font-inter-medium text-[15px] text-ink"
                    >
                      {displayName.length > 0 ? displayName : "—"}
                    </Text>
                    {displayEmail.length > 0 && (
                      <Text numberOfLines={1} className="mt-0.5 text-xs text-faint">
                        {displayEmail}
                      </Text>
                    )}
                  </View>
                  <ChevronRight size={18} color={colors.faint} strokeWidth={1.8} />
                </View>
              )}
            </GlassCard>
          </Pressable>

          <GlassCard className="overflow-hidden">
            <View className="flex-row items-center justify-between px-4 py-3.5">
              <View className="mr-3 flex-1">
                <Text className="font-inter-medium text-[15px] text-ink">
                  {t("settings.language")}
                </Text>
                <Text className="mt-0.5 text-xs text-faint">
                  {t("settings.languageDescription")}
                </Text>
              </View>
              <LanguageSegmentedControl />
            </View>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <View className="divide-y divide-line">
              <SettingsRow
                icon={LifeBuoy}
                label={t("settings.support")}
                description={t("settings.supportDescription")}
                onPress={() => router.push("/support")}
              />
              <SettingsRow
                icon={Share2}
                label={t("settings.recommend")}
                description={t("settings.recommendDescription")}
                onPress={() => void shareApp(t("settings.recommendMessage"))}
              />
              <SettingsRow
                icon={Info}
                label={t("settings.about")}
                description={t("settings.aboutDescription")}
                onPress={() => router.push("/about")}
              />
            </View>
          </GlassCard>

          <Pressable
            className="flex-row items-center gap-3 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3.5 active:opacity-70"
            onPress={handleLogout}
          >
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface">
              <LogOut size={20} color={colors.danger} strokeWidth={1.8} />
            </View>
            <Text className="flex-1 font-inter-medium text-[15px] text-danger">
              {t("settings.logout")}
            </Text>
          </Pressable>

          <Text className="mt-6 text-center text-xs text-faint">
            {t("settings.version", { version: appVersion })}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
