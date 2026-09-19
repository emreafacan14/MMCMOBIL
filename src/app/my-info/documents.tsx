/**
 * My Documents list: files uploaded once here can then be attached to any
 * card. Rows offer share/open, edit and delete.
 */

import { Share2, Pencil, Plus, Trash2, FileText } from "lucide-react-native";
import { useEffect, type ReactElement, type ReactNode } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import type { ListRenderItemInfo } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/EmptyState";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { colors } from "@/constants/theme";
import {
  useMyDocuments,
  useRemoveDocument,
} from "@/hooks/queries/documentQueries";
import { useHaptic } from "@/hooks/useHaptic";
import { useTranslation } from "@/i18n";
import { confirmDialog } from "@/store/confirmStore";
import { toast } from "@/store/toastStore";
import { toApiError } from "@/services/client";
import { sharePrivateDocument } from "@/utils/documentFiles";
import type { UserDocument } from "@/types/api";

export default function DocumentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const haptic = useHaptic();
  const listQuery = useMyDocuments();
  const removeMutation = useRemoveDocument();

  useEffect(() => {
    if (listQuery.isError) {
      toast.error(t("common.networkError"));
    }
  }, [listQuery.isError, t]);

  const openCreateForm = () => {
    haptic("light");
    router.push("/my-info/document-form");
  };

  const handleEditPress = (item: UserDocument) => {
    haptic("light");
    router.push(`/my-info/document-form?id=${item.id}`);
  };

  const handleDeleteRequest = (item: UserDocument) => {
    haptic("warning");
    confirmDialog.show({
      title: t("myInfo.deleteTitle"),
      message: t("myInfo.deleteMessage", { title: item.title }),
      confirmLabel: t("common.delete"),
      tone: "danger",
      onConfirm: () => void handleDeleteConfirm(item),
    });
  };

  const handleDeleteConfirm = async (item: UserDocument) => {
    try {
      await removeMutation.mutateAsync(item.id);
      haptic("success");
      toast.success(t("toast.deleted"));
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  const handleSharePress = async (item: UserDocument) => {
    haptic("light");

    try {
      await sharePrivateDocument(item);
    } catch {
      toast.error(t("common.unexpectedError"));
    }
  };

  const renderRow = ({ item }: ListRenderItemInfo<UserDocument>): ReactElement => (
    <GlassCard className="mb-3 p-4">
      <View className="flex-row items-center">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface">
          <FileText size={18} color={colors.primaryStrong} />
        </View>
        <View className="ml-3 flex-1">
          <Text numberOfLines={1} className="font-inter-medium text-[15px] text-ink">
            {item.title}
          </Text>
          <Text numberOfLines={1} className="mt-0.5 text-sm text-muted">
            {item.fileName}
          </Text>
        </View>
        <View className="ml-3 flex-row gap-2">
          <Pressable
            onPress={() => void handleSharePress(item)}
            accessibilityRole="button"
            accessibilityLabel={t("common.share")}
            hitSlop={6}
            className="h-[34px] w-[34px] items-center justify-center rounded-xl border border-line bg-surface"
          >
            <Share2 size={16} color={colors.success} />
          </Pressable>
          <Pressable
            onPress={() => handleEditPress(item)}
            accessibilityRole="button"
            accessibilityLabel={t("common.edit")}
            hitSlop={6}
            className="h-[34px] w-[34px] items-center justify-center rounded-xl border border-line bg-surface"
          >
            <Pencil size={16} color={colors.muted} />
          </Pressable>
          <Pressable
            onPress={() => handleDeleteRequest(item)}
            accessibilityRole="button"
            accessibilityLabel={t("common.delete")}
            hitSlop={6}
            className="h-[34px] w-[34px] items-center justify-center rounded-xl border border-line bg-surface"
          >
            <Trash2 size={16} color={colors.danger} />
          </Pressable>
        </View>
      </View>
    </GlassCard>
  );

  const renderBody = (): ReactNode => {
    const items = listQuery.data ?? [];

    if (listQuery.isLoading) {
      return (
        <View className="gap-y-3 px-5 pt-2">
          <Skeleton className="h-[72px] rounded-2xl" />
          <Skeleton className="h-[72px] rounded-2xl" />
          <Skeleton className="h-[72px] rounded-2xl" />
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-5">
          <EmptyState
            icon={FileText}
            title={t("myInfo.documents.empty")}
            actionLabel={t("myInfo.documents.add")}
            onAction={openCreateForm}
          />
        </View>
      );
    }

    return (
      <FlatList<UserDocument>
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRow}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-transparent" edges={["left", "right", "bottom"]}>
      <ScreenHeader
        large
        title={t("myInfo.documents.title")}
        subtitle={t("myInfo.subtitle")}
        onBack={() => router.back()}
        right={
          <Pressable
            onPress={openCreateForm}
            accessibilityRole="button"
            accessibilityLabel={t("myInfo.documents.add")}
            hitSlop={6}
            className="h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary-dim"
          >
            <Plus size={20} color={colors.ink} strokeWidth={1.8} />
          </Pressable>
        }
      />
      {renderBody()}
    </SafeAreaView>
  );
}
