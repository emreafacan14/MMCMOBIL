/**
 * "Add to card" pickers: one overlay body per contact-info kind.
 * Displays all user-owned items with clear status badges (already bound vs not bound)
 * and direct quick-action buttons to create a new item if none exist.
 */

import { AtSign, FileText, Mail, MapPin, Phone } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "@/i18n";
import { useHaptic } from "@/hooks/useHaptic";
import {
  cardAddressHooks,
  cardDocumentHooks,
  cardEmailHooks,
  cardPhoneHooks,
  cardSocialMediaHooks,
} from "@/hooks/queries/cardBindingQueries";
import {
  userAddressHooks,
  userEmailHooks,
  userPhoneHooks,
  userSocialMediaHooks,
} from "@/hooks/queries/contactInfoQueries";
import { useMyDocuments } from "@/hooks/queries/documentQueries";
import {
  apiErrorMessage,
  PALETTE,
  type PickerOption,
} from "./parts";
import { PickerList } from "./parts";
import { toast } from "@/store/toastStore";
import type { UserAddress } from "@/types/api";
import { formatPhoneNumber } from "@/components/my-info/shared";

interface BindPickerProps {
  cardId: number;
  /** userXIds already bound to the card */
  boundUserIds: ReadonlySet<number>;
  nextDisplayOrder: number;
  onClose: () => void;
}

/** "Mahalle, İlçe, İl" one-liner for user-owned addresses (nullable parts). */
function formatUserAddressLine(address: UserAddress): string {
  return [address.neighborhoodName, address.districtName, address.cityName]
    .filter((part): part is string => part !== null && part.length > 0)
    .join(", ");
}

export function PhoneBindPicker({
  cardId,
  boundUserIds,
  nextDisplayOrder,
  onClose,
}: BindPickerProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const haptic = useHaptic();
  const userList = userPhoneHooks.useList();
  const create = cardPhoneHooks.useCreate(cardId);

  const options: PickerOption[] = (userList.data ?? []).map((phone) => ({
    id: phone.id,
    icon: <Phone size={20} color={PALETTE.muted} />,
    title: phone.title ?? formatPhoneNumber(phone.phoneNumber),
    subtitle:
      phone.title === null ? undefined : formatPhoneNumber(phone.phoneNumber),
    isBound: boundUserIds.has(phone.id),
  }));

  const handleBind = async (userPhoneId: number): Promise<void> => {
    try {
      await create.mutateAsync({
        cardId,
        userPhoneId,
        isPrimary: false,
        displayOrder: nextDisplayOrder,
      });
      haptic("success");
      toast.success(t("toast.addedToCard"));
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error) ?? t("common.unexpectedError"));
    }
  };

  const handleCreateNew = () => {
    haptic("light");
    onClose();
    router.push("/my-info/phone-form");
  };

  return (
    <PickerList
      isLoading={userList.isLoading}
      options={options}
      emptyTitle={t("cardDetail.noItemsYet")}
      emptyDescription={t("cardDetail.noItemsHint")}
      createLabel={t("cardDetail.createNew")}
      addLabel={t("cardDetail.addThis")}
      alreadyBoundLabel={t("cardDetail.alreadyBound")}
      onCreateNew={handleCreateNew}
      onSelect={(userPhoneId) => {
        void handleBind(userPhoneId);
      }}
    />
  );
}

export function EmailBindPicker({
  cardId,
  boundUserIds,
  nextDisplayOrder,
  onClose,
}: BindPickerProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const haptic = useHaptic();
  const userList = userEmailHooks.useList();
  const create = cardEmailHooks.useCreate(cardId);

  const options: PickerOption[] = (userList.data ?? []).map((email) => ({
    id: email.id,
    icon: <Mail size={20} color={PALETTE.muted} />,
    title: email.title ?? email.emailAddress,
    subtitle: email.title === null ? undefined : email.emailAddress,
    isBound: boundUserIds.has(email.id),
  }));

  const handleBind = async (userEmailId: number): Promise<void> => {
    try {
      await create.mutateAsync({
        cardId,
        userEmailId,
        isPrimary: false,
        displayOrder: nextDisplayOrder,
      });
      haptic("success");
      toast.success(t("toast.addedToCard"));
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error) ?? t("common.unexpectedError"));
    }
  };

  const handleCreateNew = () => {
    haptic("light");
    onClose();
    router.push("/my-info/email-form");
  };

  return (
    <PickerList
      isLoading={userList.isLoading}
      options={options}
      emptyTitle={t("cardDetail.noItemsYet")}
      emptyDescription={t("cardDetail.noItemsHint")}
      createLabel={t("cardDetail.createNew")}
      addLabel={t("cardDetail.addThis")}
      alreadyBoundLabel={t("cardDetail.alreadyBound")}
      onCreateNew={handleCreateNew}
      onSelect={(userEmailId) => {
        void handleBind(userEmailId);
      }}
    />
  );
}

export function AddressBindPicker({
  cardId,
  boundUserIds,
  nextDisplayOrder,
  onClose,
}: BindPickerProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const haptic = useHaptic();
  const userList = userAddressHooks.useList();
  const create = cardAddressHooks.useCreate(cardId);

  const options: PickerOption[] = (userList.data ?? []).map((address) => ({
    id: address.id,
    icon: <MapPin size={20} color={PALETTE.muted} />,
    title: address.title ?? formatUserAddressLine(address),
    subtitle:
      address.title === null ? undefined : formatUserAddressLine(address),
    isBound: boundUserIds.has(address.id),
  }));

  const handleBind = async (userAddressId: number): Promise<void> => {
    try {
      await create.mutateAsync({
        cardId,
        userAddressId,
        isPrimary: false,
        displayOrder: nextDisplayOrder,
      });
      haptic("success");
      toast.success(t("toast.addedToCard"));
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error) ?? t("common.unexpectedError"));
    }
  };

  const handleCreateNew = () => {
    haptic("light");
    onClose();
    router.push("/my-info/address-form");
  };

  return (
    <PickerList
      isLoading={userList.isLoading}
      options={options}
      emptyTitle={t("cardDetail.noItemsYet")}
      emptyDescription={t("cardDetail.noItemsHint")}
      createLabel={t("cardDetail.createNew")}
      addLabel={t("cardDetail.addThis")}
      alreadyBoundLabel={t("cardDetail.alreadyBound")}
      onCreateNew={handleCreateNew}
      onSelect={(userAddressId) => {
        void handleBind(userAddressId);
      }}
    />
  );
}

/** Social media binding has no isPrimary field — display order only. */
export function SocialBindPicker({
  cardId,
  boundUserIds,
  nextDisplayOrder,
  onClose,
}: BindPickerProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const haptic = useHaptic();
  const userList = userSocialMediaHooks.useList();
  const create = cardSocialMediaHooks.useCreate(cardId);

  const options: PickerOption[] = (userList.data ?? []).map((social) => ({
    id: social.id,
    icon: <AtSign size={20} color={PALETTE.muted} />,
    title: social.title ?? social.socialMediaPlatformName ?? social.url,
    subtitle: social.username ?? social.url,
    isBound: boundUserIds.has(social.id),
  }));

  const handleBind = async (userSocialMediaId: number): Promise<void> => {
    try {
      await create.mutateAsync({
        cardId,
        userSocialMediaId,
        displayOrder: nextDisplayOrder,
      });
      haptic("success");
      toast.success(t("toast.addedToCard"));
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error) ?? t("common.unexpectedError"));
    }
  };

  const handleCreateNew = () => {
    haptic("light");
    onClose();
    router.push("/my-info/social-media-form");
  };

  return (
    <PickerList
      isLoading={userList.isLoading}
      options={options}
      emptyTitle={t("cardDetail.noItemsYet")}
      emptyDescription={t("cardDetail.noItemsHint")}
      createLabel={t("cardDetail.createNew")}
      addLabel={t("cardDetail.addThis")}
      alreadyBoundLabel={t("cardDetail.alreadyBound")}
      onCreateNew={handleCreateNew}
      onSelect={(userSocialMediaId) => {
        void handleBind(userSocialMediaId);
      }}
    />
  );
}

/**
 * Documents bind by reference: lists user documents with status badge and quick add.
 */
export function DocumentBindPicker({
  cardId,
  boundUserIds,
  nextDisplayOrder,
  onClose,
}: BindPickerProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const haptic = useHaptic();
  const userList = useMyDocuments();
  const create = cardDocumentHooks.useCreate(cardId);

  const options: PickerOption[] = (userList.data ?? []).map((document) => ({
    id: document.id,
    icon: <FileText size={20} color={PALETTE.muted} />,
    title: document.title,
    subtitle: document.fileName ?? undefined,
    isBound: boundUserIds.has(document.id),
  }));

  const handleBind = async (userDocumentId: number): Promise<void> => {
    try {
      await create.mutateAsync({
        cardId,
        userDocumentId,
        displayOrder: nextDisplayOrder,
      });
      haptic("success");
      toast.success(t("toast.addedToCard"));
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error) ?? t("common.unexpectedError"));
    }
  };

  const handleCreateNew = () => {
    haptic("light");
    onClose();
    router.push("/my-info/document-form");
  };

  return (
    <PickerList
      isLoading={userList.isLoading}
      options={options}
      emptyTitle={t("cardDetail.noItemsYet")}
      emptyDescription={t("cardDetail.noItemsHint")}
      createLabel={t("cardDetail.createNew")}
      addLabel={t("cardDetail.addThis")}
      alreadyBoundLabel={t("cardDetail.alreadyBound")}
      onCreateNew={handleCreateNew}
      onSelect={(userDocumentId) => {
        void handleBind(userDocumentId);
      }}
    />
  );
}
