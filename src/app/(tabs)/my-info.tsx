import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AtSign,
  ChevronRight,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react-native";

import { GlassCard, ScreenHeader, Skeleton } from "@/components/ui";
import { colors } from "@/constants/theme";
import {
  userAddressHooks,
  userEmailHooks,
  userPhoneHooks,
  userSocialMediaHooks,
} from "@/hooks/queries/contactInfoQueries";
import { useMyDocuments } from "@/hooks/queries/documentQueries";
import { useHaptic } from "@/hooks/useHaptic";
import { useTranslation } from "@/i18n";

interface VaultCategoryProps {
  icon: LucideIcon;
  title: string;
  count: number | undefined;
  isLoading: boolean;
  onPress: () => void;
  accentColor?: string;
}

function VaultCategoryCard({
  icon: Icon,
  title,
  count,
  isLoading,
  onPress,
  accentColor = colors.primaryStrong,
}: VaultCategoryProps) {
  const haptic = useHaptic();

  const handlePress = () => {
    haptic("light");
    onPress();
  };

  const countText =
    count === undefined || count === 0
      ? "—"
      : `${count}`;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      className="active:opacity-70"
    >
      <GlassCard className="p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3.5 flex-1 pr-2">
            <View className="h-11 w-11 items-center justify-center rounded-2xl border border-line bg-surface-strong">
              <Icon size={20} color={accentColor} strokeWidth={1.8} />
            </View>
            <View className="flex-1">
              <Text className="font-inter-semibold text-[15px] text-ink">
                {title}
              </Text>
              {isLoading ? (
                <Skeleton className="mt-1.5 h-3.5 w-24 rounded-md" />
              ) : (
                <Text className="mt-0.5 text-xs text-muted">
                  {count === 0 ? "Henüz eklenmedi" : `${count} kayıtlı`}
                </Text>
              )}
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-6 w-9 rounded-xl" />
            ) : (
              <View className="rounded-xl border border-line bg-surface px-2.5 py-1">
                <Text className="font-inter-semibold text-xs text-ink">
                  {countText}
                </Text>
              </View>
            )}
            <ChevronRight size={18} color={colors.faint} strokeWidth={1.8} />
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}

export default function MyInfoScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const phonesQuery = userPhoneHooks.useList();
  const emailsQuery = userEmailHooks.useList();
  const addressesQuery = userAddressHooks.useList();
  const socialsQuery = userSocialMediaHooks.useList();
  const docsQuery = useMyDocuments();

  const isRefreshing =
    phonesQuery.isRefetching ||
    emailsQuery.isRefetching ||
    addressesQuery.isRefetching ||
    socialsQuery.isRefetching ||
    docsQuery.isRefetching;

  const handleRefresh = () => {
    void phonesQuery.refetch();
    void emailsQuery.refetch();
    void addressesQuery.refetch();
    void socialsQuery.refetch();
    void docsQuery.refetch();
  };

  const isInitialLoading =
    phonesQuery.isLoading ||
    emailsQuery.isLoading ||
    addressesQuery.isLoading ||
    socialsQuery.isLoading ||
    docsQuery.isLoading;

  const totalRecords =
    (phonesQuery.data?.length ?? 0) +
    (emailsQuery.data?.length ?? 0) +
    (addressesQuery.data?.length ?? 0) +
    (socialsQuery.data?.length ?? 0) +
    (docsQuery.data?.length ?? 0);

  return (
    <View className="flex-1 bg-transparent">
      <ScreenHeader
        large
        title={t("myInfo.title")}
        subtitle={t("myInfo.subtitle")}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 128,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.gold}
          />
        }
      >
        <View className="gap-3.5">
          {/* Vault Hero Overview */}
          <GlassCard className="p-4 border-primary/20 bg-primary-dim/20">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary-dim">
                <Sparkles size={19} color={colors.gold} strokeWidth={1.8} />
              </View>
              <View className="flex-1">
                <Text className="font-inter-semibold text-[14px] text-ink">
                  {t("myInfo.vaultTitle")}
                </Text>
                <Text className="mt-0.5 text-xs text-muted leading-relaxed">
                  {t("myInfo.vaultSubtitle")}
                </Text>
              </View>
              <View className="items-end">
                {isInitialLoading ? (
                  <Skeleton className="h-5 w-7 rounded-md" />
                ) : (
                  <Text className="font-inter-extrabold text-base text-primary-strong">
                    {totalRecords}
                  </Text>
                )}
                <Text className="text-[10px] font-inter-medium text-faint">
                  TOPLAM
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Category Cards (A-Z Sorted) */}
          <VaultCategoryCard
            icon={MapPin}
            title={t("myInfo.addresses.title")}
            count={addressesQuery.data?.length}
            isLoading={addressesQuery.isLoading}
            onPress={() => router.push("/my-info/addresses")}
          />

          <VaultCategoryCard
            icon={FileText}
            title={t("myInfo.documents.title")}
            count={docsQuery.data?.length}
            isLoading={docsQuery.isLoading}
            onPress={() => router.push("/my-info/documents")}
          />

          <VaultCategoryCard
            icon={Mail}
            title={t("myInfo.emails.title")}
            count={emailsQuery.data?.length}
            isLoading={emailsQuery.isLoading}
            onPress={() => router.push("/my-info/emails")}
          />

          <VaultCategoryCard
            icon={AtSign}
            title={t("myInfo.socials.title")}
            count={socialsQuery.data?.length}
            isLoading={socialsQuery.isLoading}
            onPress={() => router.push("/my-info/social-medias")}
          />

          <VaultCategoryCard
            icon={Phone}
            title={t("myInfo.phones.title")}
            count={phonesQuery.data?.length}
            isLoading={phonesQuery.isLoading}
            onPress={() => router.push("/my-info/phones")}
          />

          {/* Informational Tip Card */}
          <View className="mt-2 flex-row items-center gap-2.5 px-2">
            <ShieldCheck size={16} color={colors.faint} strokeWidth={1.8} />
            <Text className="flex-1 text-xs text-faint leading-relaxed">
              Buradaki bilgiler ana kasanızda güvenle saklanır ve dilediğiniz kartınıza anında bağlanabilir.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
