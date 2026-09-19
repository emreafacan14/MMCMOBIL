/**
 * Card-bound contact-info data layer and sections: set-primary / unbind
 * mutations plus the four rendered list sections of the card detail screen.
 * Underscore prefix keeps this file out of the Expo Router manifest.
 */

import { useState } from "react";
import { Text, View } from "react-native";
import { AtSign, FileText, Mail, MapPin, Phone } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui";
import { useTranslation } from "@/i18n";
import { queryKeys } from "@/hooks/queries/queryKeys";
import {
  cardAddressHooks,
  cardDocumentHooks,
  cardEmailHooks,
  cardPhoneHooks,
  cardSocialMediaHooks,
} from "@/hooks/queries/cardBindingQueries";
import { useMyDocuments } from "@/hooks/queries/documentQueries";
import { useHaptic } from "@/hooks/useHaptic";
import { ApiError } from "@/services/client";
import { confirmDialog } from "@/store/confirmStore";
import { toast } from "@/store/toastStore";
import type {
  CardAddress,
  CardDocument,
  CardEmail,
  CardPhone,
  CardSocialMedia,
  MyCardDetail,
} from "@/types/api";
import { formatAddressLine, sortByPrimary } from "@/utils/contact";
import { formatPhoneNumber } from "@/components/my-info/shared";
import {
  BoundSection,
  PALETTE,
  type BindableKind,
} from "./parts";

/** Extracts the backend message from an ApiError; null when unmapped. */
function apiErrorMessage(error: unknown): string | null {
  if (error instanceof ApiError && error.message.length > 0) {
    return error.message;
  }

  return null;
}

export interface CardBindingActions {
  /** Opens a confirm dialog; the mutation runs only after the user confirms. */
  makePrimaryPhone: (item: CardPhone) => void;
  makePrimaryEmail: (item: CardEmail) => void;
  makePrimaryAddress: (item: CardAddress) => void;
  unbindPhone: (item: CardPhone) => void;
  unbindEmail: (item: CardEmail) => void;
  unbindAddress: (item: CardAddress) => void;
  unbindSocial: (item: CardSocialMedia) => void;
  unbindDocument: (item: CardDocument) => void;
  isBusy: boolean;
}

/**
 * Set-primary + unbind mutations for one card's bound lists.
 * Every action first asks for confirmation via the global confirm modal; the
 * mutation runs only when the user confirms. Toasts/haptics are handled here;
 * query invalidation lives in the hooks.
 * Update bodies carry the full record (cardId, userXId, isPrimary,
 * displayOrder) because the endpoints replace the binding.
 */
export function useCardBindingActions(
  detail: MyCardDetail,
): CardBindingActions {
  const { t } = useTranslation();
  const haptic = useHaptic();
  const [busyKind, setBusyKind] = useState<BindableKind | null>(null);

  const phoneUpdate = cardPhoneHooks.useUpdate(detail.id);
  const emailUpdate = cardEmailHooks.useUpdate(detail.id);
  const addressUpdate = cardAddressHooks.useUpdate(detail.id);
  const phoneRemove = cardPhoneHooks.useRemove(detail.id);
  const emailRemove = cardEmailHooks.useRemove(detail.id);
  const addressRemove = cardAddressHooks.useRemove(detail.id);
  const socialRemove = cardSocialMediaHooks.useRemove(detail.id);
  const documentRemove = cardDocumentHooks.useRemove(detail.id);

  const notifySuccess = (message: string) => {
    haptic("success");
    toast.success(message);
  };

  const notifyFailure = (error: unknown) => {
    haptic("error");
    toast.error(apiErrorMessage(error) ?? t("common.unexpectedError"));
  };

  /** Global confirm modal; `run` executes only when the user confirms. */
  const confirmThenRun = (
    title: string,
    message: string,
    confirmLabel: string,
    destructive: boolean,
    run: () => Promise<void>,
  ): void => {
    confirmDialog.show({
      title,
      message,
      confirmLabel,
      tone: destructive ? "danger" : "primary",
      onConfirm: () => {
        void run();
      },
    });
  };

  const runUpdate = async (
    kind: BindableKind,
    run: () => Promise<unknown>,
    successMessage: string,
  ): Promise<void> => {
    setBusyKind(kind);
    try {
      await run();
      notifySuccess(successMessage);
    } catch (error) {
      notifyFailure(error);
    } finally {
      setBusyKind(null);
    }
  };

  const runRemove = async (
    kind: BindableKind,
    run: () => Promise<unknown>,
  ): Promise<void> => {
    setBusyKind(kind);
    try {
      await run();
      notifySuccess(t("toast.removedFromCard"));
    } catch (error) {
      notifyFailure(error);
    } finally {
      setBusyKind(null);
    }
  };

  const queryClient = useQueryClient();

  const makePrimaryPhone = (item: CardPhone): void =>
    confirmThenRun(
      t("cardDetail.primaryConfirmTitle"),
      t("cardDetail.primaryConfirmMessage"),
      t("cardDetail.makePrimary"),
      false,
      () =>
        runUpdate(
          "phone",
          async () => {
            queryClient.setQueryData<MyCardDetail>(
              queryKeys.cards.detail(detail.id),
              (old) => {
                if (!old) return old;
                return {
                  ...old,
                  phones: old.phones.map((p) => ({
                    ...p,
                    isPrimary: p.id === item.id,
                  })),
                };
              },
            );

            await phoneUpdate.mutateAsync({
              id: item.id,
              data: {
                cardId: detail.id,
                userPhoneId: item.userPhoneId,
                isPrimary: true,
                displayOrder: item.displayOrder,
              },
            });
          },
          t("toast.primarySet"),
        ),
    );

  const makePrimaryEmail = (item: CardEmail): void =>
    confirmThenRun(
      t("cardDetail.primaryConfirmTitle"),
      t("cardDetail.primaryConfirmMessage"),
      t("cardDetail.makePrimary"),
      false,
      () =>
        runUpdate(
          "email",
          async () => {
            queryClient.setQueryData<MyCardDetail>(
              queryKeys.cards.detail(detail.id),
              (old) => {
                if (!old) return old;
                return {
                  ...old,
                  emails: old.emails.map((e) => ({
                    ...e,
                    isPrimary: e.id === item.id,
                  })),
                };
              },
            );

            await emailUpdate.mutateAsync({
              id: item.id,
              data: {
                cardId: detail.id,
                userEmailId: item.userEmailId,
                isPrimary: true,
                displayOrder: item.displayOrder,
              },
            });
          },
          t("toast.primarySet"),
        ),
    );

  const makePrimaryAddress = (item: CardAddress): void =>
    confirmThenRun(
      t("cardDetail.primaryConfirmTitle"),
      t("cardDetail.primaryConfirmMessage"),
      t("cardDetail.makePrimary"),
      false,
      () =>
        runUpdate(
          "address",
          async () => {
            queryClient.setQueryData<MyCardDetail>(
              queryKeys.cards.detail(detail.id),
              (old) => {
                if (!old) return old;
                return {
                  ...old,
                  addresses: old.addresses.map((a) => ({
                    ...a,
                    isPrimary: a.id === item.id,
                  })),
                };
              },
            );

            await addressUpdate.mutateAsync({
              id: item.id,
              data: {
                cardId: detail.id,
                userAddressId: item.userAddressId,
                isPrimary: true,
                displayOrder: item.displayOrder,
              },
            });
          },
          t("toast.primarySet"),
        ),
    );

  return {
    makePrimaryPhone,
    makePrimaryEmail,
    makePrimaryAddress,
    unbindPhone: (item) =>
      confirmThenRun(
        t("cardDetail.removeConfirmTitle"),
        t("cardDetail.removeConfirmMessage"),
        t("cardDetail.removeFromCard"),
        true,
        () =>
          runRemove("phone", async () => {
            queryClient.setQueryData<MyCardDetail>(
              queryKeys.cards.detail(detail.id),
              (old) => {
                if (!old) return old;
                return {
                  ...old,
                  phones: old.phones.filter((p) => p.id !== item.id),
                };
              },
            );
            await phoneRemove.mutateAsync({ id: item.id });
          }),
      ),
    unbindEmail: (item) =>
      confirmThenRun(
        t("cardDetail.removeConfirmTitle"),
        t("cardDetail.removeConfirmMessage"),
        t("cardDetail.removeFromCard"),
        true,
        () =>
          runRemove("email", async () => {
            queryClient.setQueryData<MyCardDetail>(
              queryKeys.cards.detail(detail.id),
              (old) => {
                if (!old) return old;
                return {
                  ...old,
                  emails: old.emails.filter((e) => e.id !== item.id),
                };
              },
            );
            await emailRemove.mutateAsync({ id: item.id });
          }),
      ),
    unbindAddress: (item) =>
      confirmThenRun(
        t("cardDetail.removeConfirmTitle"),
        t("cardDetail.removeConfirmMessage"),
        t("cardDetail.removeFromCard"),
        true,
        () =>
          runRemove("address", async () => {
            queryClient.setQueryData<MyCardDetail>(
              queryKeys.cards.detail(detail.id),
              (old) => {
                if (!old) return old;
                return {
                  ...old,
                  addresses: old.addresses.filter((a) => a.id !== item.id),
                };
              },
            );
            await addressRemove.mutateAsync({ id: item.id });
          }),
      ),
    unbindSocial: (item) =>
      confirmThenRun(
        t("cardDetail.removeConfirmTitle"),
        t("cardDetail.removeConfirmMessage"),
        t("cardDetail.removeFromCard"),
        true,
        () =>
          runRemove("social", async () => {
            queryClient.setQueryData<MyCardDetail>(
              queryKeys.cards.detail(detail.id),
              (old) => {
                if (!old) return old;
                return {
                  ...old,
                  socialMedia: old.socialMedia.filter((s) => s.id !== item.id),
                };
              },
            );
            await socialRemove.mutateAsync({ id: item.id });
          }),
      ),
    unbindDocument: (item) =>
      confirmThenRun(
        t("cardDetail.removeConfirmTitle"),
        t("cardDetail.removeConfirmMessage"),
        t("cardDetail.removeFromCard"),
        true,
        () =>
          runRemove("document", async () => {
            queryClient.setQueryData<CardDocument[]>(
              queryKeys.cards.documents(detail.id),
              (old) => {
                if (!old) return old;
                return old.filter((d) => d.id !== item.id);
              },
            );
            await documentRemove.mutateAsync({ id: item.id });
          }),
      ),
    isBusy:
      busyKind !== null ||
      phoneUpdate.isPending ||
      emailUpdate.isPending ||
      addressUpdate.isPending ||
      phoneRemove.isPending ||
      emailRemove.isPending ||
      addressRemove.isPending ||
      socialRemove.isPending ||
      documentRemove.isPending,
  };
}

interface CardDetailSectionsProps {
  detail: MyCardDetail;
  actions: CardBindingActions;
  /** Opens the "add to card" picker overlay for the given kind. */
  onOpenPicker: (kind: BindableKind) => void;
}

/** Manage hint + phones / emails / addresses / socials / documents sections. */
export function CardDetailSections({
  detail,
  actions,
  onOpenPicker,
}: CardDetailSectionsProps) {
  const { t } = useTranslation();

  const addressesQuery = cardAddressHooks.useList(detail.id);
  const documentsQuery = cardDocumentHooks.useList(detail.id);
  const emailsQuery = cardEmailHooks.useList(detail.id);
  const socialsQuery = cardSocialMediaHooks.useList(detail.id);
  const phonesQuery = cardPhoneHooks.useList(detail.id);

  const addresses = addressesQuery.data ?? detail.addresses ?? [];
  const emails = emailsQuery.data ?? detail.emails ?? [];
  const phones = phonesQuery.data ?? detail.phones ?? [];
  const socials = [...(socialsQuery.data ?? detail.socialMedia ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const documents = [...(documentsQuery.data ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  const sharedProps = {
    emptyText: t("cardDetail.emptySection"),
    addLabel: t("cardDetail.addToCard"),
    badgeText: t("cardDetail.primaryBadge"),
    primaryActionLabel: t("cardDetail.makePrimary"),
    removeActionLabel: t("cardDetail.removeFromCard"),
    busy: actions.isBusy,
  } as const;

  return (
    <View>
      <Text className="mb-1 mt-8 text-xs text-faint">
        {t("cardDetail.manageHint")}
      </Text>

      <GlassCard className="mt-3 p-4">
        <BoundSection
          icon={MapPin}
          title={t("cardDetail.sections.addresses")}
          items={sortByPrimary(addresses)}
          {...sharedProps}
          canSetPrimary
          onAdd={() => onOpenPicker("address")}
          itemId={(item) => item.id}
          isPrimaryOf={(item) => item.isPrimary}
          describe={(item) => ({
            icon: <MapPin size={20} color={PALETTE.muted} />,
            title: item.title ?? formatAddressLine(item),
            subtitle: item.title === null ? undefined : formatAddressLine(item),
          })}
          onSetPrimary={(item) => {
            void actions.makePrimaryAddress(item);
          }}
          onUnbind={(item) => {
            void actions.unbindAddress(item);
          }}
        />
      </GlassCard>

      {/* Card documents reference my-documents; unbind leaves the file itself. */}
      <GlassCard className="mt-3 p-4">
        <BoundSection
          icon={FileText}
          title={t("cardDetail.sections.documents")}
          items={documents}
          {...sharedProps}
          canSetPrimary={false}
          onAdd={() => onOpenPicker("document")}
          itemId={(item) => item.id}
          isPrimaryOf={() => false}
          describe={(item) => ({
            icon: <FileText size={20} color={PALETTE.muted} />,
            title: item.title,
            subtitle: item.fileName,
          })}
          onUnbind={(item) => {
            void actions.unbindDocument(item);
          }}
        />
      </GlassCard>

      <GlassCard className="mt-3 p-4">
        <BoundSection
          icon={Mail}
          title={t("cardDetail.sections.emails")}
          items={sortByPrimary(emails)}
          {...sharedProps}
          canSetPrimary
          onAdd={() => onOpenPicker("email")}
          itemId={(item) => item.id}
          isPrimaryOf={(item) => item.isPrimary}
          describe={(item) => ({
            icon: <Mail size={20} color={PALETTE.muted} />,
            title: item.title ?? item.emailAddress,
            subtitle: item.title === null ? undefined : item.emailAddress,
          })}
          onSetPrimary={(item) => {
            void actions.makePrimaryEmail(item);
          }}
          onUnbind={(item) => {
            void actions.unbindEmail(item);
          }}
        />
      </GlassCard>

      {/* Social media bindings carry no isPrimary flag — order only. */}
      <GlassCard className="mt-3 p-4">
        <BoundSection
          icon={AtSign}
          title={t("cardDetail.sections.socials")}
          items={socials}
          {...sharedProps}
          canSetPrimary={false}
          onAdd={() => onOpenPicker("social")}
          itemId={(item) => item.id}
          isPrimaryOf={() => false}
          describe={(item) => ({
            icon: <AtSign size={20} color={PALETTE.muted} />,
            title: item.title ?? item.socialMediaPlatformName,
            subtitle: item.username ?? item.url,
          })}
          onUnbind={(item) => {
            void actions.unbindSocial(item);
          }}
        />
      </GlassCard>

      <GlassCard className="mt-3 p-4">
        <BoundSection
          icon={Phone}
          title={t("cardDetail.sections.phones")}
          items={sortByPrimary(phones)}
          {...sharedProps}
          canSetPrimary
          onAdd={() => onOpenPicker("phone")}
          itemId={(item) => item.id}
          isPrimaryOf={(item) => item.isPrimary}
          describe={(item) => ({
            icon: <Phone size={20} color={PALETTE.muted} />,
            title: item.title ?? formatPhoneNumber(item.phoneNumber),
            subtitle:
              item.title === null ? undefined : formatPhoneNumber(item.phoneNumber),
          })}
          onSetPrimary={(item) => {
            void actions.makePrimaryPhone(item);
          }}
          onUnbind={(item) => {
            void actions.unbindPhone(item);
          }}
        />
      </GlassCard>

      {/* Spacer so last card isn't hidden behind the tab bar */}
      <View className="h-10" />
    </View>
  );
}
