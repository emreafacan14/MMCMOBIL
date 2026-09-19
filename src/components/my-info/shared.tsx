/**
 * Shared building blocks for the my-info contact CRUD screens (lists +
 * forms). The underscore prefix keeps Expo Router from registering this
 * file as a route.
 */

import { Check } from "lucide-react-native";
import type { ReactElement, ReactNode } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import type { TranslationKey } from "@/i18n";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { KeyboardActionBar } from "@/components/ui/KeyboardActionBar";
import { colors } from "@/constants/theme";
import { useHaptic } from "@/hooks/useHaptic";
import {
  ADDRESS_TYPE,
  EMAIL_TYPE,
  PHONE_NUMBER_TYPE,
  type AddressType,
  type EmailType,
  type PhoneNumberType,
  type UserAddress,
} from "@/types/api";

/** Minimal shape of the context translator, injectable into pure helpers. */
export type Translate = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

// ---------------------------------------------------------------------------
// Type labels
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Route param "?id=" -> editing id, or null for create mode (NaN-safe). */
export function parseEditingId(rawId: string | undefined): number | null {
  if (rawId === undefined || rawId.length === 0) {
    return null;
  }

  const parsed = Number.parseInt(rawId, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

/** Numeric text field value -> integer or null (building no / floor / ...). */
export function toIntOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

/** Strips every non-digit character (spaces, dashes, parens, plus signs). */
export function sanitizePhoneNumber(value: string): string {
  return value.replace(/\D/g, "");
}

/** Formats ten-digit user numbers as `532 123 12 12` or `374 229 40 64`. */
export function formatPhoneNumber(value: string): string {
  const digits = sanitizePhoneNumber(value).slice(0, 10);
  const groups = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 8),
    digits.slice(8, 10),
  ];

  return groups.filter((group) => group.length > 0).join(" ");
}

/** Trimmed text, or null when empty — for optional server-side strings. */
export function optionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function phoneNumberTypeLabel(type: PhoneNumberType, t: Translate): string {
  switch (type) {
    case PHONE_NUMBER_TYPE.Mobile:
      return t("myInfo.phones.typeMobile");
    case PHONE_NUMBER_TYPE.Home:
      return t("myInfo.phones.typeHome");
    case PHONE_NUMBER_TYPE.Work:
      return t("myInfo.phones.typeWork");
  }
}

export function emailTypeLabel(type: EmailType, t: Translate): string {
  switch (type) {
    case EMAIL_TYPE.Personal:
      return t("myInfo.emails.typePersonal");
    case EMAIL_TYPE.Work:
      return t("myInfo.emails.typeWork");
    case EMAIL_TYPE.Corporate:
      return t("myInfo.emails.typeCorporate");
    case EMAIL_TYPE.Support:
      return t("myInfo.emails.typeSupport");
    case EMAIL_TYPE.Sales:
      return t("myInfo.emails.typeSales");
    case EMAIL_TYPE.Other:
      return t("myInfo.emails.typeOther");
  }
}

export function addressTypeLabel(type: AddressType, t: Translate): string {
  switch (type) {
    case ADDRESS_TYPE.Home:
      return t("myInfo.addresses.typeHome");
    case ADDRESS_TYPE.Work:
      return t("myInfo.addresses.typeWork");
    case ADDRESS_TYPE.Office:
      return t("myInfo.addresses.typeOffice");
    case ADDRESS_TYPE.Branch:
      return t("myInfo.addresses.typeBranch");
    case ADDRESS_TYPE.Other:
      return t("myInfo.addresses.typeOther");
  }
}

/** One-line address summary: "Mahalle, İlçe, İl" or the raw full address. */
export function formatAddressSubtitle(item: UserAddress): string {
  const parts = [item.neighborhoodName, item.districtName, item.cityName].filter(
    (part): part is string => part !== null && part.length > 0,
  );

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return item.fullAddress ?? "";
}

// ---------------------------------------------------------------------------
// Form shell
// ---------------------------------------------------------------------------

interface ContactFormShellProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly saveLabel: string;
  readonly isSaving: boolean;
  readonly onSubmit: () => void;
  readonly children: ReactNode;
}

/** Header + KeyboardAwareScrollView body + sticky save button. */
export function ContactFormShell(props: ContactFormShellProps) {
  const { title, subtitle, saveLabel, isSaving, onSubmit, children } = props;
  const router = useRouter();

  // PremiumButton already fires a touch-down haptic, so none is added here.

  return (
    <SafeAreaView className="flex-1 bg-transparent" edges={["left", "right"]}>
      <ScreenHeader title={title} subtitle={subtitle} onBack={() => router.back()} />
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
        {children}
      </KeyboardAwareScrollView>
      <KeyboardActionBar>
        <PremiumButton
          label={saveLabel}
          icon={<Check size={18} color="#FFFFFF" />}
          onPress={() => onSubmit()}
          loading={isSaving}
          size="lg"
          fullWidth
        />
      </KeyboardActionBar>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Type chip selector
// ---------------------------------------------------------------------------

interface ChipOption<T extends number> {
  readonly value: T;
  readonly label: string;
}

interface TypeChipSelectorProps<T extends number> {
  readonly label: string;
  readonly options: readonly ChipOption<T>[];
  readonly value: T | null;
  readonly onChange: (value: T) => void;
}

export function TypeChipSelector<T extends number>(props: TypeChipSelectorProps<T>) {
  const { label, options, value, onChange } = props;
  const haptic = useHaptic();

  const handleSelect = (optionValue: T) => {
    haptic("selection");
    onChange(optionValue);
  };

  return (
    <View className="gap-y-2">
      <Text className="font-inter-medium text-sm text-muted">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              accessibilityRole="button"
              className={
                isActive
                  ? "rounded-full border border-primary bg-primary px-4 py-2"
                  : "rounded-full border border-line bg-surface px-4 py-2"
              }
            >
              <Text
                className={
                  isActive
                    ? "font-inter-medium text-sm text-white"
                    : "font-inter-medium text-sm text-muted"
                }
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Bottom-sheet option picker (city / district / neighborhood)
// ---------------------------------------------------------------------------

export interface PickerOption {
  readonly id: number;
  readonly label: string;
}

interface OptionPickerSheetProps {
  readonly visible: boolean;
  readonly title: string;
  readonly options: readonly PickerOption[];
  readonly isLoading: boolean;
  readonly selectedId: number | null;
  readonly onSelect: (id: number) => void;
  readonly onClose: () => void;
}

export function OptionPickerSheet(props: OptionPickerSheetProps) {
  const { visible, title, options, isLoading, selectedId, onSelect, onClose } = props;
  const haptic = useHaptic();

  const handleSelect = (id: number) => {
    haptic("selection");
    onSelect(id);
  };

  const renderRow = ({ item, index }: { item: PickerOption; index: number }): ReactElement => {
    const isSelected = item.id === selectedId;
    const isLast = index === options.length - 1;

    return (
      <Pressable
        onPress={() => handleSelect(item.id)}
        accessibilityRole="button"
        className={
          isLast
            ? "flex-row items-center justify-between py-3.5"
            : "flex-row items-center justify-between border-b border-line py-3.5"
        }
      >
        <Text
          numberOfLines={1}
          className={
            isSelected
              ? "flex-1 font-inter-medium text-[15px] text-primary-strong"
              : "flex-1 font-inter-medium text-[15px] text-ink"
          }
        >
          {item.label}
        </Text>
        {isSelected ? <Check size={18} color={colors.success} /> : null}
      </Pressable>
    );
  };

  const renderContent = (): ReactNode => {
    if (isLoading) {
      return (
        <View className="gap-y-3 py-4">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </View>
      );
    }

    return (
      <FlatList<PickerOption>
        data={options}
        keyExtractor={(option) => String(option.id)}
        renderItem={renderRow}
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60">
        <Pressable
          className="flex-1"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={title}
        />
        <View className="max-h-[65%] rounded-t-3xl border-t border-line bg-elevated px-5 pb-10 pt-3">
          <View className="mb-3 h-1 w-10 self-center rounded-full bg-white/15" />
          <Text numberOfLines={1} className="mb-2 font-inter-semibold text-base text-ink">
            {title}
          </Text>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
}
