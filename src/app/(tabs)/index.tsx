import { useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  AtSign,
  ChevronRight,
  CreditCard,
  Eye,
  FileText,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  Plus,
  QrCode,
  Share2,
  X,
  Zap,
} from "lucide-react-native";

import { Avatar } from "@/components/ui/Avatar";
import { CardVisual, CARD_ASPECT_RATIO } from "@/components/ui/CardVisual";
import { ContactRow } from "@/components/ui/ContactRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { FlipCard } from "@/components/ui/FlipCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { QrCardFace } from "@/components/ui/QrCardFace";
import { Skeleton } from "@/components/ui/Skeleton";
import { colors } from "@/constants/theme";
import { useHaptic } from "@/hooks/useHaptic";
import { useMyCards } from "@/hooks/queries/cardQueries";
import { useMyProfile } from "@/hooks/queries/profileQueries";
import { useTranslation } from "@/i18n";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";
import { shareCardVcfSafe } from "@/utils/cardSharing";
import { publicCardService } from "@/services/publicCardService";

interface QuickActionChipProps {
  icon: typeof Phone;
  label: string;
  onPress: () => void;
  accentColor?: string;
}

function QuickActionChip({
  icon: Icon,
  label,
  onPress,
  accentColor = colors.primaryStrong,
}: QuickActionChipProps) {
  const haptic = useHaptic();

  const handlePress = () => {
    haptic("light");
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      className="flex-1 active:opacity-70"
    >
      <GlassCard className="p-3.5 items-center justify-center min-h-[100px]">
        <View className="h-10 w-10 items-center justify-center rounded-2xl border border-line bg-surface-strong mb-2">
          <Icon size={20} color={accentColor} strokeWidth={1.8} />
        </View>
        <Text
          numberOfLines={2}
          className="font-inter-medium text-xs text-ink text-center leading-tight"
        >
          {label}
        </Text>
      </GlassCard>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const haptic = useHaptic();

  const sessionUser = useAuthStore((state) => state.user);
  const profileQuery = useMyProfile();
  const cardsQuery = useMyCards();

  const [isQrFlipped, setIsQrFlipped] = useState(false);

  const cards = cardsQuery.data ?? [];
  const primaryCard =
    cards.find((card) => card.isActive && !card.isRevoked) ?? cards[0];
  const otherCards =
    primaryCard === undefined
      ? []
      : cards.filter((card) => card.id !== primaryCard.id);

  const givenName = profileQuery.data?.name ?? sessionUser?.name ?? "";
  const familyName = profileQuery.data?.surname ?? sessionUser?.surname ?? "";
  const displayName = `${givenName} ${familyName}`.trim();

  useEffect(() => {
    if (cardsQuery.isError) {
      toast.error(t("common.networkError"));
    }
  }, [cardsQuery.isError, t]);

  const handleActivate = () => {
    haptic("light");
    router.push("/activate");
  };

  const handleViewAllCards = () => {
    haptic("light");
    router.push("/(tabs)/cards");
  };

  const handleShare = (urlKey: string) => {
    haptic("light");
    void shareCardVcfSafe(urlKey, t("common.unexpectedError"));
  };

  const handleOpenCard = (cardId: number) => {
    haptic("light");
    router.push(`/(tabs)/cards?cardId=${cardId}`);
  };

  const isRefreshing = cardsQuery.isRefetching || profileQuery.isRefetching;
  const handleRefresh = () => {
    void cardsQuery.refetch();
    void profileQuery.refetch();
  };

  const profileImagePath =
    profileQuery.data?.profileImagePath ??
    primaryCard?.cardProfileImagePath ??
    null;

  const publicUrl = primaryCard
    ? publicCardService.buildPublicWebUrl(primaryCard.urlKey)
    : "";

  return (
    <SafeAreaView className="flex-1 bg-transparent" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.gold}
          />
        }
      >
        {/* Top Header: User Profile Avatar & Greeting */}
        <View className="flex-row items-center justify-between py-2">
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              haptic("light");
              router.push("/account");
            }}
            className="flex-row items-center gap-3 active:opacity-75 flex-1 pr-2"
          >
            <Avatar
              imagePath={profileImagePath}
              name={givenName}
              surname={familyName}
              size={48}
            />
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="font-inter-bold text-[10px] uppercase tracking-[2px] text-primary-strong">
                  {t("home.digitalId")}
                </Text>
                <View className="h-1.5 w-1.5 rounded-full bg-success" />
              </View>
              <Text
                numberOfLines={1}
                className="text-xl font-inter-extrabold tracking-tight text-ink"
              >
                {t("home.greeting", { name: givenName.length > 0 ? givenName : sessionUser?.name ?? "" })}
              </Text>
            </View>
          </Pressable>

          {primaryCard && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isQrFlipped ? t("home.hideQr") : t("home.showQr")}
              onPress={() => {
                haptic("light");
                setIsQrFlipped((previous) => !previous);
              }}
              className="h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary-dim active:opacity-70"
            >
              {isQrFlipped ? (
                <X size={20} color={colors.gold} strokeWidth={2} />
              ) : (
                <QrCode size={20} color={colors.gold} strokeWidth={1.8} />
              )}
            </Pressable>
          )}
        </View>

        {/* Hero Card Visual Section */}
        {cardsQuery.isLoading ? (
          <View className="mt-4 gap-3">
            <Skeleton className="h-52 rounded-3xl" />
            <Skeleton className="h-16 rounded-2xl" />
          </View>
        ) : cards.length === 0 ? (
          <View className="mt-4">
            <GlassCard>
              <EmptyState
                icon={CreditCard}
                title={t("home.noCardTitle")}
                description={t("home.noCardDescription")}
                actionLabel={t("home.activateCta")}
                onAction={handleActivate}
              />
            </GlassCard>
          </View>
        ) : primaryCard === undefined ? null : (
          <View className="mt-4">
            <FlipCard
              aspectRatio={CARD_ASPECT_RATIO}
              flipped={isQrFlipped}
              front={
                <CardVisual
                  fullName={primaryCard.userFullName ?? displayName ?? primaryCard.urlKey}
                />
              }
              back={<QrCardFace value={publicUrl} caption={t("home.scanHint")} />}
              onBackPress={() => {
                haptic("light");
                setIsQrFlipped(false);
              }}
            />

            {/* Quick Card Status & View Count Badge */}
            <View className="mt-3 flex-row items-center justify-between px-1">
              <View className="flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-success" />
                <Text className="font-inter-medium text-xs text-muted">
                  {t("home.statusActive")}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Eye size={13} color={colors.faint} strokeWidth={2} />
                <Text className="font-inter-medium text-xs text-faint">
                  {t("cards.viewCount", { count: primaryCard.viewCount })}
                </Text>
              </View>
            </View>

            {/* Primary Action Buttons (Share, Edit) */}
            <View className="mt-3 flex-row items-stretch gap-2.5">
              <View className="flex-1">
                <PremiumButton
                  label={t("home.shareCta")}
                  variant="secondary"
                  size="md"
                  icon={<Share2 size={16} color={colors.ink} strokeWidth={1.8} />}
                  onPress={() => handleShare(primaryCard.urlKey)}
                />
              </View>
              <View className="flex-1">
                <PremiumButton
                  label={t("home.editCta")}
                  variant="primary"
                  size="md"
                  icon={<PencilLine size={16} color="#FFFFFF" strokeWidth={1.8} />}
                  onPress={() => handleOpenCard(primaryCard.id)}
                />
              </View>
            </View>
          </View>
        )}

        {/* Modern Quick Actions Grid */}
        <View className="mt-6">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[16px] font-inter-bold tracking-tight text-ink">
              {t("home.quickActionsTitle")}
            </Text>
          </View>

          <View className="gap-3">
            <View className="flex-row gap-3">
              <QuickActionChip
                icon={MapPin}
                label={t("home.addAddress")}
                accentColor={colors.primaryStrong}
                onPress={() => router.push("/my-info/address-form")}
              />
              <QuickActionChip
                icon={FileText}
                label={t("home.addDocument")}
                accentColor={colors.primaryStrong}
                onPress={() => router.push("/my-info/document-form")}
              />
              <QuickActionChip
                icon={Mail}
                label={t("home.addEmail")}
                accentColor={colors.primaryStrong}
                onPress={() => router.push("/my-info/email-form")}
              />
            </View>

            <View className="flex-row gap-3">
              <QuickActionChip
                icon={AtSign}
                label={t("home.addSocial")}
                accentColor={colors.primaryStrong}
                onPress={() => router.push("/my-info/social-media-form")}
              />
              <QuickActionChip
                icon={Phone}
                label={t("home.addPhone")}
                accentColor={colors.primaryStrong}
                onPress={() => router.push("/my-info/phone-form")}
              />
              <QuickActionChip
                icon={Plus}
                label={t("home.activateCard")}
                accentColor={colors.gold}
                onPress={handleActivate}
              />
            </View>
          </View>
        </View>



        {/* Other Cards Section (If User Has Multiple Cards) */}
        {otherCards.length > 0 && (
          <View className="mt-6">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[16px] font-inter-bold tracking-tight text-ink">
                {t("home.cardsSectionTitle")}
              </Text>
              <Pressable onPress={handleViewAllCards} hitSlop={8}>
                <Text className="text-xs font-inter-medium text-primary-strong">
                  {t("home.viewAll")}
                </Text>
              </Pressable>
            </View>

            <FlatList
              horizontal
              data={otherCards}
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
              renderItem={({ item }) => (
                <ContactRow
                  icon={
                    <CreditCard size={18} color={colors.muted} strokeWidth={1.8} />
                  }
                  title={item.userFullName ?? item.urlKey}
                  onPress={() => handleOpenCard(item.id)}
                />
              )}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
