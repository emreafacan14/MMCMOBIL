/**
 * Shared building blocks for the card detail screen (and its bind pickers).
 * Underscore prefix keeps this file out of the Expo Router manifest.
 */

import { type ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import {
  Check,
  Inbox,
  Plus,
  Star,
  Unlink,
  type LucideIcon,
} from "lucide-react-native";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ContactRow } from "@/components/ui/ContactRow";
import { useHaptic } from "@/hooks/useHaptic";
import { ApiError } from "@/services/client";

/**
 * Mirror of tailwind.config.js palette tokens for the few places that need
 * raw values (lucide SVG icons take a `color` prop, not a className).
 */
export const PALETTE = {
  base: "#070810",
  ink: "#F7F8FF",
  muted: "#A7ADC4",
  faint: "#6B728F",
  primary: "#7667F8",
  primaryStrong: "#A89DFF",
  primaryDim: "#24204E",
  success: "#51D6A3",
  danger: "#FF7485",
  warning: "#F5C76B",
} as const;

/** Extracts the backend message from an ApiError; null when unmapped. */
export function apiErrorMessage(error: unknown): string | null {
  if (error instanceof ApiError && error.message.length > 0) {
    return error.message;
  }

  return null;
}

/**
 * Builds the ReactNode expected by PremiumButton's `icon` slot, sized and
 * tinted for its variant (white on primary, ink on secondary, primaryStrong
 * on ghost — mirroring VARIANT_TOKENS label colors).
 */
export function buttonIcon(Icon: LucideIcon, color: string): ReactNode {
  return <Icon size={20} color={color} strokeWidth={2} />;
}

export const BUTTON_ICON_COLOR = {
  primary: "#FFFFFF",
  secondary: PALETTE.ink,
  ghost: PALETTE.primaryStrong,
} as const;

/** Kinds of contact info that can be bound to a card. */
export type BindableKind = "phone" | "email" | "address" | "social" | "document";

interface OverlayModalProps {
  visible: boolean;
  onClose: () => void;
  closeAccessibilityLabel: string;
  children: ReactNode;
}

/** Full-screen dimmed backdrop with a centered glass panel. */
export function OverlayModal({
  visible,
  onClose,
  closeAccessibilityLabel,
  children,
}: OverlayModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <View className="absolute inset-0 z-50">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={closeAccessibilityLabel}
        onPress={onClose}
        className="absolute inset-0 bg-black/70"
      />
      <View
        pointerEvents="box-none"
        className="absolute inset-0 items-center justify-center px-6"
      >
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(140)}
          className="w-full"
        >
          {children}
        </Animated.View>
      </View>
    </View>
  );
}

interface SmallIconButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
  disabled?: boolean;
}

/** Compact 34x34 action chip used in ContactRow right slots and pickers. */
export function SmallIconButton({
  icon: Icon,
  onPress,
  accessibilityLabel,
  color = PALETTE.muted,
  disabled = false,
}: SmallIconButtonProps) {
  const haptic = useHaptic();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        haptic("light");
        onPress();
      }}
      className={`h-[34px] w-[34px] items-center justify-center rounded-xl border border-line bg-surface ${
        disabled ? "opacity-40" : ""
      }`}
    >
      <Icon size={16} color={color} strokeWidth={2} />
    </Pressable>
  );
}

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
}

/** Icon + bold title row above each contact-info section. */
export function SectionHeader({ icon: Icon, title }: SectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center gap-2">
      <Icon size={18} color={PALETTE.primary} strokeWidth={2} />
      <Text className="font-inter-semibold text-base text-ink">{title}</Text>
    </View>
  );
}

interface ItemView {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

interface BoundSectionProps<TItem> {
  icon: LucideIcon;
  title: string;
  items: TItem[];
  emptyText: string;
  addLabel: string;
  onAdd: () => void;
  badgeText: string;
  primaryActionLabel: string;
  removeActionLabel: string;
  busy: boolean;
  canSetPrimary: boolean;
  describe: (item: TItem) => ItemView;
  itemId: (item: TItem) => number;
  isPrimaryOf: (item: TItem) => boolean;
  onSetPrimary?: (item: TItem) => void;
  onUnbind: (item: TItem) => void;
}

/**
 * One card-bound list section: rows with primary badge, set-primary and
 * unbind chips, plus the ghost "add to card" button that opens the picker.
 */
export function BoundSection<TItem>({
  icon,
  title,
  items,
  emptyText,
  addLabel,
  onAdd,
  badgeText,
  primaryActionLabel,
  removeActionLabel,
  busy,
  canSetPrimary,
  describe,
  itemId,
  isPrimaryOf,
  onSetPrimary,
  onUnbind,
}: BoundSectionProps<TItem>) {
  return (
    <View>
      <SectionHeader icon={icon} title={title} />
      {items.length === 0 ? (
        <Text className="text-sm text-faint">{emptyText}</Text>
      ) : (
        <View className="gap-2">
          {items.map((item) => {
            const view = describe(item);
            const isPrimary = isPrimaryOf(item);

            return (
              <ContactRow
                key={itemId(item)}
                icon={view.icon}
                title={view.title}
                subtitle={view.subtitle}
                badge={isPrimary ? badgeText : undefined}
                right={
                  <View className="flex-row gap-2">
                    {canSetPrimary && !isPrimary && onSetPrimary ? (
                      <SmallIconButton
                        icon={Star}
                        color={PALETTE.warning}
                        disabled={busy}
                        accessibilityLabel={primaryActionLabel}
                        onPress={() => onSetPrimary(item)}
                      />
                    ) : null}
                    <SmallIconButton
                      icon={Unlink}
                      color={PALETTE.danger}
                      disabled={busy}
                      accessibilityLabel={removeActionLabel}
                      onPress={() => onUnbind(item)}
                    />
                  </View>
                }
              />
            );
          })}
        </View>
      )}
      <PremiumButton
        label={addLabel}
        icon={buttonIcon(Plus, BUTTON_ICON_COLOR.ghost)}
        variant="ghost"
        fullWidth={false}
        wrapperClassName="mt-1 self-center"
        onPress={onAdd}
      />
    </View>
  );
}

interface PublicSectionProps<TItem> {
  icon: LucideIcon;
  title: string;
  items: TItem[];
  emptyText: string;
  describe: (item: TItem) => ItemView;
  itemKey: (item: TItem) => number;
  renderActions: (item: TItem) => ReactNode;
}

/** Read-only section used by the public card page. */
export function PublicSection<TItem>({
  icon,
  title,
  items,
  emptyText,
  describe,
  itemKey,
  renderActions,
}: PublicSectionProps<TItem>) {
  return (
    <View className="mt-7">
      <SectionHeader icon={icon} title={title} />
      {items.length === 0 ? (
        <Text className="text-sm text-faint">{emptyText}</Text>
      ) : (
        <View className="gap-2">
          {items.map((item) => {
            const view = describe(item);

            return (
              <ContactRow
                key={itemKey(item)}
                icon={view.icon}
                title={view.title}
                subtitle={view.subtitle}
                right={renderActions(item)}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

export interface PickerOption {
  id: number;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  isBound: boolean;
}

interface PickerListProps {
  isLoading: boolean;
  options: PickerOption[];
  emptyTitle: string;
  emptyDescription?: string;
  onCreateNew?: () => void;
  createLabel?: string;
  addLabel?: string;
  alreadyBoundLabel?: string;
  onSelect: (userItemId: number) => void;
}

/** Scrollable chooser body inside the bind picker overlay. */
export function PickerList({
  isLoading,
  options,
  emptyTitle,
  emptyDescription,
  onCreateNew,
  createLabel = "Yeni Ekle",
  addLabel = "Ekle",
  alreadyBoundLabel = "Karta Ekli",
  onSelect,
}: PickerListProps) {
  if (isLoading) {
    return (
      <View className="gap-2">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </View>
    );
  }

  if (options.length === 0) {
    return (
      <View className="py-2 items-center">
        <EmptyState
          icon={Inbox}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={createLabel}
          onAction={onCreateNew}
        />
      </View>
    );
  }

  return (
    <View>
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        className="max-h-[340px]"
        contentContainerStyle={{ gap: 8 }}
      >
        {options.map((option) => (
          <ContactRow
            key={option.id}
            icon={option.icon}
            title={option.title}
            subtitle={option.subtitle}
            onPress={option.isBound ? undefined : () => onSelect(option.id)}
            right={
              option.isBound ? (
                <View className="flex-row items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1.5">
                  <Check size={13} color={PALETTE.success} strokeWidth={2.5} />
                  <Text className="text-xs font-inter-semibold text-success">
                    {alreadyBoundLabel}
                  </Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => onSelect(option.id)}
                  accessibilityRole="button"
                  className="flex-row items-center gap-1.5 rounded-xl border border-primary/40 bg-primary px-3.5 py-2 active:opacity-75"
                >
                  <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
                  <Text className="text-xs font-inter-semibold text-white">
                    {addLabel}
                  </Text>
                </Pressable>
              )
            }
          />
        ))}
      </ScrollView>

      {onCreateNew && (
        <View className="mt-5">
          <PremiumButton
            label={createLabel}
            variant="primary"
            size="lg"
            icon={<Plus size={20} color="#FFFFFF" strokeWidth={2.4} />}
            fullWidth
            onPress={onCreateNew}
          />
        </View>
      )}
    </View>
  );
}
