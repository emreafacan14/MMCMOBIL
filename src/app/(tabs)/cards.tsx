import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import {
  CircleAlert,
  Copy,
  CreditCard,
  ImagePlus,
  Link as LinkIcon,
  Nfc,
  Plus,
  QrCode,
  Share2,
  X,
} from "lucide-react-native";

import { CardVisual } from "@/components/ui/CardVisual";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassCard } from "@/components/ui/GlassCard";
import { NfcWriteModal } from "@/components/card/NfcWriteModal";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { colors } from "@/constants/theme";
import { useHaptic } from "@/hooks/useHaptic";
import {
  useMyCardDetail,
  useMyCards,
  useUpdateCardProfileImage,
} from "@/hooks/queries/cardQueries";
import {
  cardAddressHooks,
  cardDocumentHooks,
  cardEmailHooks,
  cardPhoneHooks,
  cardSocialMediaHooks,
} from "@/hooks/queries/cardBindingQueries";
import { useTranslation } from "@/i18n";
import { publicCardService } from "@/services/publicCardService";
import { resolvePublicUrl, toApiError } from "@/services/client";
import { copyCardLink, shareCardVcfSafe } from "@/utils/cardSharing";
import { isWithinUploadLimit, pickImageFromLibrary } from "@/utils/filePicking";
import { toast } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import type { CardSummary, MyCardDetail } from "@/types/api";
import {
  buttonIcon,
  BUTTON_ICON_COLOR,
  OverlayModal,
  PALETTE,
  type BindableKind,
} from "@/components/card/parts";
import {
  CardDetailSections,
  useCardBindingActions,
} from "@/components/card/binding";
import {
  AddressBindPicker,
  DocumentBindPicker,
  EmailBindPicker,
  PhoneBindPicker,
  SocialBindPicker,
} from "@/components/card/pickers";

const BANNER_TONES = {
  danger: {
    border: "border-danger/30",
    text: "text-danger",
    icon: PALETTE.danger,
  },
  warning: {
    border: "border-warning/30",
    text: "text-warning",
    icon: PALETTE.warning,
  },
} as const;

function StatusBanner({ tone, message }: { tone: keyof typeof BANNER_TONES; message: string }) {
  const classes = BANNER_TONES[tone];

  return (
    <GlassCard className={`mt-4 flex-row items-center gap-3 border p-4 ${classes.border}`}>
      <CircleAlert size={20} color={classes.icon} strokeWidth={2} />
      <Text className={`flex-1 text-sm ${classes.text}`}>{message}</Text>
    </GlassCard>
  );
}

function CardPhotoThumb({ imagePath }: { imagePath: string | null }) {
  const uri = resolvePublicUrl(imagePath);

  return (
    <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-line bg-surface">
      {uri === null ? (
        <ImagePlus size={22} color={colors.faint} strokeWidth={1.8} />
      ) : (
        <Image source={{ uri }} className="h-full w-full" fadeDuration={120} />
      )}
    </View>
  );
}

function CardPhotoSection({
  cardId,
  imagePath,
}: {
  cardId: number;
  imagePath: string | null;
}) {
  const { t } = useTranslation();
  const haptic = useHaptic();
  const uploadMutation = useUpdateCardProfileImage();

  const handlePickPhoto = async () => {
    haptic("light");

    try {
      const picked = await pickImageFromLibrary();

      if (picked === null) {
        return;
      }

      if (!isWithinUploadLimit(picked)) {
        haptic("error");
        toast.error(t("cardDetail.photoTooLarge"));
        return;
      }

      await uploadMutation.mutateAsync({ cardId, file: picked });
      haptic("success");
      toast.success(t("toast.updated"));
    } catch (error) {
      haptic("error");
      toast.error(toApiError(error).message);
    }
  };

  return (
    <GlassCard className="mt-4 p-4">
      <View className="flex-row items-center gap-3">
        <CardPhotoThumb imagePath={imagePath} />
        <View className="mr-3 flex-1">
          <Text className="font-inter-medium text-[15px] text-ink">
            {t("cardDetail.cardPhotoTitle")}
          </Text>
          <Text className="mt-0.5 text-xs text-faint">
            {t("cardDetail.cardPhotoDescription")}
          </Text>
        </View>
      </View>
      <PremiumButton
        label={
          imagePath === null
            ? t("cardDetail.uploadCardPhoto")
            : t("cardDetail.changeCardPhoto")
        }
        icon={buttonIcon(ImagePlus, BUTTON_ICON_COLOR.ghost)}
        variant="ghost"
        fullWidth={false}
        wrapperClassName="mt-3 self-end"
        loading={uploadMutation.isPending}
        onPress={() => void handlePickPhoto()}
      />
    </GlassCard>
  );
}

interface ActiveCardBoundDetailsProps {
  cardSummary: CardSummary;
  detail: MyCardDetail;
  onOpenPicker: (kind: BindableKind) => void;
  onShowQr: () => void;
  onCopyLink: () => void;
  onShare: () => void;
  onWriteNfc: () => void;
}

function ActiveCardBoundDetails({
  cardSummary,
  detail,
  onOpenPicker,
  onShowQr,
  onCopyLink,
  onShare,
  onWriteNfc,
}: ActiveCardBoundDetailsProps) {
  const { t } = useTranslation();
  const actions = useCardBindingActions(detail);

  return (
    <View className="mt-4">
      {/* Action Buttons */}
      <View className="gap-2.5">
        <PremiumButton
          label={t("nfc.writeButton")}
          icon={buttonIcon(Nfc, BUTTON_ICON_COLOR.primary)}
          variant="primary"
          fullWidth
          onPress={onWriteNfc}
        />
        <View className="flex-row flex-wrap gap-2.5">
          <PremiumButton
            label={t("cardDetail.showQr")}
            icon={buttonIcon(QrCode, BUTTON_ICON_COLOR.secondary)}
            variant="secondary"
            fullWidth={false}
            wrapperClassName="min-w-[45%] flex-1"
            onPress={onShowQr}
          />
          <PremiumButton
            label={t("cardDetail.copyLink")}
            icon={buttonIcon(LinkIcon, BUTTON_ICON_COLOR.secondary)}
            variant="secondary"
            fullWidth={false}
            wrapperClassName="min-w-[45%] flex-1"
            onPress={onCopyLink}
          />
        </View>
        <PremiumButton
          label={t("cardDetail.shareCard")}
          icon={buttonIcon(Share2, BUTTON_ICON_COLOR.secondary)}
          variant="secondary"
          fullWidth
          onPress={onShare}
        />
      </View>

      {/* Card Photo Section */}
      <CardPhotoSection
        cardId={detail.id}
        imagePath={cardSummary.cardProfileImagePath ?? null}
      />

      {/* Status Warning Banners */}
      {detail.isRevoked ? (
        <StatusBanner tone="danger" message={t("cardDetail.revokedWarning")} />
      ) : detail.activatedAt === null ? (
        <StatusBanner tone="warning" message={t("cardDetail.notActivatedWarning")} />
      ) : null}

      {/* Bound Contact & File Sections */}
      <CardDetailSections
        detail={detail}
        actions={actions}
        onOpenPicker={onOpenPicker}
      />
    </View>
  );
}

export default function MyCardsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const haptic = useHaptic();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ cardId?: string }>();
  const user = useAuthStore((state) => state.user);

  const cardsQuery = useMyCards();
  const cards = cardsQuery.data ?? [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isQrVisible, setIsQrVisible] = useState(false);
  const [isNfcVisible, setIsNfcVisible] = useState(false);
  const [pickerKind, setPickerKind] = useState<BindableKind | null>(null);

  const carouselRef = useRef<FlatList<CardSummary>>(null);
  const CARD_ITEM_WIDTH = width - 40;

  // Handle incoming cardId from query params (e.g. from Home screen)
  useEffect(() => {
    if (params.cardId && cards.length > 0) {
      const targetId = Number.parseInt(params.cardId, 10);
      const foundIdx = cards.findIndex((c) => c.id === targetId);
      if (foundIdx >= 0 && foundIdx !== activeIndex) {
        setActiveIndex(foundIdx);
        carouselRef.current?.scrollToIndex({ index: foundIdx, animated: true });
      }
    }
  }, [params.cardId, cards]);

  const activeCard = cards[activeIndex] ?? cards[0];
  const activeCardId = activeCard?.id ?? null;

  const detailQuery = useMyCardDetail(activeCardId ?? undefined);
  const phonesListQuery = cardPhoneHooks.useList(activeCardId ?? undefined);
  const emailsListQuery = cardEmailHooks.useList(activeCardId ?? undefined);
  const addressesListQuery = cardAddressHooks.useList(activeCardId ?? undefined);
  const socialsListQuery = cardSocialMediaHooks.useList(activeCardId ?? undefined);
  const documentsQuery = cardDocumentHooks.useList(activeCardId ?? undefined);

  const handleAddCard = () => {
    haptic("light");
    router.push("/activate");
  };

  const handleShare = (urlKey: string) => {
    haptic("light");
    void shareCardVcfSafe(urlKey, t("common.unexpectedError"));
  };

  const handleCopyLink = (urlKey: string) => {
    haptic("light");
    copyCardLink(urlKey, t("toast.linkCopied")).catch(() => {
      toast.error(t("common.unexpectedError"));
    });
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / CARD_ITEM_WIDTH);
    if (newIndex >= 0 && newIndex < cards.length && newIndex !== activeIndex) {
      haptic("selection");
      setActiveIndex(newIndex);
    }
  };

  const pickerTitles: Record<BindableKind, string> = {
    phone: t("myInfo.phones.add"),
    email: t("myInfo.emails.add"),
    address: t("myInfo.addresses.add"),
    social: t("myInfo.socials.add"),
    document: t("myInfo.documents.add"),
  };

  const boundPhoneUserIds = new Set(
    (phonesListQuery.data ?? detailQuery.data?.phones ?? []).map((p) => p.userPhoneId),
  );
  const boundEmailUserIds = new Set(
    (emailsListQuery.data ?? detailQuery.data?.emails ?? []).map((e) => e.userEmailId),
  );
  const boundAddressUserIds = new Set(
    (addressesListQuery.data ?? detailQuery.data?.addresses ?? []).map((a) => a.userAddressId),
  );
  const boundSocialUserIds = new Set(
    (socialsListQuery.data ?? detailQuery.data?.socialMedia ?? []).map((s) => s.userSocialMediaId),
  );
  const boundDocumentUserIds = new Set(
    (documentsQuery.data ?? []).map((d) => d.userDocumentId),
  );

  const isRefreshing = cardsQuery.isRefetching || detailQuery.isRefetching;
  const handleRefresh = () => {
    void cardsQuery.refetch();
    if (activeCardId) {
      void detailQuery.refetch();
    }
  };

  return (
    <View className="flex-1 bg-transparent">
      <ScreenHeader
        large
        title={t("cards.title")}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("cards.newCard")}
            onPress={handleAddCard}
            className="h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary-dim active:opacity-70"
          >
            <Plus size={20} color={colors.ink} strokeWidth={1.8} />
          </Pressable>
        }
      />

      {cardsQuery.isLoading ? (
        <View className="px-5 pt-2 gap-3">
          <Skeleton className="h-52 rounded-3xl" />
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </View>
      ) : cards.length === 0 ? (
        <View className="flex-1 px-5 pt-2">
          <GlassCard>
            <EmptyState
              icon={CreditCard}
              title={t("cards.emptyTitle")}
              description={t("cards.emptyDescription")}
              actionLabel={t("cards.newCard")}
              onAction={handleAddCard}
            />
          </GlassCard>
        </View>
      ) : (
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
          {/* Horizontal Swipeable Card Carousel */}
          <FlatList
            ref={carouselRef}
            horizontal
            pagingEnabled
            snapToInterval={CARD_ITEM_WIDTH + 16}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            data={cards}
            keyExtractor={(item) => String(item.id)}
            onMomentumScrollEnd={onScrollEnd}
            contentContainerStyle={{ gap: 16 }}
            renderItem={({ item }) => {
              const fullName =
                item.userFullName ??
                (user ? `${user.name} ${user.surname}`.trim() : item.urlKey);

              return (
                <View style={{ width: CARD_ITEM_WIDTH }}>
                  <CardVisual fullName={fullName} />
                </View>
              );
            }}
          />

          {/* Pagination Indicator Dots */}
          {cards.length > 1 && (
            <View className="mt-3.5 flex-row items-center justify-center gap-1.5">
              {cards.map((card, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <Pressable
                    key={card.id}
                    onPress={() => {
                      haptic("selection");
                      setActiveIndex(idx);
                      carouselRef.current?.scrollToIndex({
                        index: idx,
                        animated: true,
                      });
                    }}
                    className={`h-2 rounded-full transition-all ${
                      isActive
                        ? "w-6 bg-primary-strong"
                        : "w-2 bg-line"
                    }`}
                  />
                );
              })}
            </View>
          )}

          {/* Active Card Bound Details and Sections */}
          {activeCard && (
            detailQuery.isLoading ? (
              <View className="mt-4 gap-3">
                <Skeleton className="h-14 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
              </View>
            ) : detailQuery.data ? (
              <ActiveCardBoundDetails
                cardSummary={activeCard}
                detail={detailQuery.data}
                onOpenPicker={(kind) => setPickerKind(kind)}
                onShowQr={() => setIsQrVisible(true)}
                onCopyLink={() => handleCopyLink(activeCard.urlKey)}
                onShare={() => handleShare(activeCard.urlKey)}
                onWriteNfc={() => setIsNfcVisible(true)}
              />
            ) : null
          )}
        </ScrollView>
      )}

      {/* NFC Write Overlay Modal */}
      {activeCard && (
        <NfcWriteModal
          visible={isNfcVisible}
          urlKey={activeCard.urlKey}
          onClose={() => setIsNfcVisible(false)}
        />
      )}

      {/* Fast QR Code Overlay Modal */}
      {activeCard && (
        <OverlayModal
          visible={isQrVisible}
          onClose={() => setIsQrVisible(false)}
          closeAccessibilityLabel={t("common.close")}
        >
          <GlassCard className="w-full items-center gap-3 p-6">
            <View className="rounded-2xl bg-white p-4">
              <QRCode
                value={publicCardService.buildPublicWebUrl(activeCard.urlKey)}
                size={200}
                color={PALETTE.base}
                backgroundColor="#FFFFFF"
              />
            </View>
            <Text className="font-inter-bold text-lg text-ink">
              {t("qr.title")}
            </Text>
            <Text className="text-center text-sm text-muted">
              {t("qr.subtitle")}
            </Text>
            <PremiumButton
              label={t("qr.copy")}
              icon={buttonIcon(Copy, BUTTON_ICON_COLOR.secondary)}
              variant="secondary"
              fullWidth
              onPress={() => handleCopyLink(activeCard.urlKey)}
            />
            <PremiumButton
              label={t("common.close")}
              variant="ghost"
              fullWidth
              onPress={() => setIsQrVisible(false)}
            />
          </GlassCard>
        </OverlayModal>
      )}

      {/* Pickers Modal */}
      {activeCard && (
        <OverlayModal
          visible={pickerKind !== null}
          onClose={() => setPickerKind(null)}
          closeAccessibilityLabel={t("common.close")}
        >
          <GlassCard className="w-full p-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="font-inter-semibold text-lg text-ink">
                {pickerKind === null ? "" : pickerTitles[pickerKind]}
              </Text>
              <Pressable
                onPress={() => {
                  haptic("light");
                  setPickerKind(null);
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t("common.close")}
                className="h-8 w-8 items-center justify-center rounded-full border border-line bg-surface active:opacity-70"
              >
                <X size={16} color={colors.muted} strokeWidth={2} />
              </Pressable>
            </View>

            {pickerKind === "phone" && (
              <PhoneBindPicker
                cardId={activeCard.id}
                boundUserIds={boundPhoneUserIds}
                nextDisplayOrder={(phonesListQuery.data ?? detailQuery.data?.phones ?? []).length}
                onClose={() => setPickerKind(null)}
              />
            )}
            {pickerKind === "email" && (
              <EmailBindPicker
                cardId={activeCard.id}
                boundUserIds={boundEmailUserIds}
                nextDisplayOrder={(emailsListQuery.data ?? detailQuery.data?.emails ?? []).length}
                onClose={() => setPickerKind(null)}
              />
            )}
            {pickerKind === "address" && (
              <AddressBindPicker
                cardId={activeCard.id}
                boundUserIds={boundAddressUserIds}
                nextDisplayOrder={(addressesListQuery.data ?? detailQuery.data?.addresses ?? []).length}
                onClose={() => setPickerKind(null)}
              />
            )}
            {pickerKind === "social" && (
              <SocialBindPicker
                cardId={activeCard.id}
                boundUserIds={boundSocialUserIds}
                nextDisplayOrder={(socialsListQuery.data ?? detailQuery.data?.socialMedia ?? []).length}
                onClose={() => setPickerKind(null)}
              />
            )}
            {pickerKind === "document" && (
              <DocumentBindPicker
                cardId={activeCard.id}
                boundUserIds={boundDocumentUserIds}
                nextDisplayOrder={(documentsQuery.data ?? []).length}
                onClose={() => setPickerKind(null)}
              />
            )}
          </GlassCard>
        </OverlayModal>
      )}
    </View>
  );
}
