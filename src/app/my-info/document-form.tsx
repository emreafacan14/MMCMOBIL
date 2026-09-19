/**
 * Document add/edit form. The file itself is picked from the device and sent
 * as multipart; editing without re-picking keeps the current file.
 */

import { FileText, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { FormFieldsSkeleton, TextField } from "@/components/ui";
import { colors } from "@/constants/theme";
import {
  useMyDocuments,
  useSaveDocument,
} from "@/hooks/queries/documentQueries";
import { useHaptic } from "@/hooks/useHaptic";
import { useTranslation } from "@/i18n";
import { toast } from "@/store/toastStore";
import { toApiError } from "@/services/client";
import type { PickedFile } from "@/types/api";
import {
  isWithinUploadLimit,
  pickDocumentFile,
} from "@/utils/filePicking";

import { ContactFormShell, parseEditingId } from "@/components/my-info/shared";

function FileSelectionField({
  label,
  value,
  placeholder,
  hint,
  onPress,
}: {
  label: string;
  value: string | null;
  placeholder: string;
  hint: string | null;
  onPress: () => void;
}) {
  const haptic = useHaptic();

  const handlePress = () => {
    haptic("light");
    onPress();
  };

  return (
    <View className="gap-y-2">
      <Text className="font-inter-medium text-sm text-muted">{label}</Text>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        className="flex-row items-center gap-3 rounded-2xl border border-line bg-elevated/80 px-4 py-3"
      >
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface">
          <FileText size={17} color={colors.primaryStrong} />
        </View>
        <Text
          numberOfLines={1}
          className={
            value === null ? "flex-1 text-sm text-faint" : "flex-1 text-sm text-ink"
          }
        >
          {value ?? placeholder}
        </Text>
      </Pressable>
      {hint !== null && <Text className="text-xs text-faint">{hint}</Text>}
    </View>
  );
}

export default function DocumentFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const haptic = useHaptic();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editingId = parseEditingId(id);

  const listQuery = useMyDocuments();
  const saveMutation = useSaveDocument();

  const [title, setTitle] = useState("");
  // null -> no (re)placement chosen; undefined only in edit mode's "keep current".
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);

  const initializedForRef = useRef<number | null>(null);
  const didHandleMissingRef = useRef(false);

  const item =
    editingId === null ? undefined : listQuery.data?.find((entry) => entry.id === editingId);

  // Prefill once per edited record; never clobber in-progress edits.
  useEffect(() => {
    if (item === undefined || initializedForRef.current === item.id) {
      return;
    }

    initializedForRef.current = item.id;
    setTitle(item.title);
  }, [item]);

  // Editing a record that no longer exists -> leave the screen.
  useEffect(() => {
    if (editingId === null || didHandleMissingRef.current || !listQuery.isSuccess) {
      return;
    }

    const exists = (listQuery.data ?? []).some((entry) => entry.id === editingId);
    if (exists) {
      return;
    }

    didHandleMissingRef.current = true;
    router.back();
  }, [editingId, listQuery.isSuccess, listQuery.data, router]);

  const handlePickFile = async () => {
    try {
      const picked = await pickDocumentFile();

      if (picked === null) {
        return;
      }

      if (!isWithinUploadLimit(picked)) {
        haptic("error");
        toast.error(t("myInfo.documents.tooLarge"));
        return;
      }

      setPickedFile(picked);
    } catch {
      toast.error(t("common.unexpectedError"));
    }
  };

  const handleRemovePicked = () => {
    haptic("light");
    setPickedFile(null);
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      haptic("error");
      toast.error(t("auth.feedback.requiredField"));
      return;
    }

    if (editingId === null && pickedFile === null) {
      haptic("error");
      toast.error(t("myInfo.documents.fileRequired"));
      return;
    }

    try {
      await saveMutation.mutateAsync({
        id: editingId,
        data: {
          title: trimmedTitle,
          file: pickedFile ?? undefined,
        },
      });
      haptic("success");
      toast.success(editingId === null ? t("toast.added") : t("toast.updated"));
      router.back();
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  if (editingId !== null && listQuery.isLoading) {
    return (
      <ContactFormShell
        title={t("myInfo.documents.formEditTitle")}
        saveLabel={t("common.save")}
        isSaving={false}
        onSubmit={() => {}}
      >
        <FormFieldsSkeleton count={3} />
      </ContactFormShell>
    );
  }

  if (editingId !== null && !listQuery.isSuccess) {
    return null; // Wait for the cached list before deciding prefill vs. back.
  }

  const screenTitle =
    editingId === null
      ? t("myInfo.documents.formAddTitle")
      : t("myInfo.documents.formEditTitle");

  const fileFieldValue =
    pickedFile !== null ? pickedFile.fileName : (item?.fileName ?? null);

  return (
    <ContactFormShell
      title={screenTitle}
      saveLabel={t("common.save")}
      isSaving={saveMutation.isPending}
      onSubmit={() => void handleSubmit()}
    >
      <TextField
        label={t("myInfo.documents.titleLabel")}
        value={title}
        onChangeText={setTitle}
        placeholder={t("myInfo.documents.titleLabel")}
      />

      <FileSelectionField
        label={t("myInfo.documents.fileLabel")}
        value={fileFieldValue}
        placeholder={
          item !== undefined
            ? t("myInfo.documents.changeFile")
            : t("myInfo.documents.selectFile")
        }
        hint={
          pickedFile === null && item !== undefined
            ? t("myInfo.documents.keepCurrentFile")
            : null
        }
        onPress={() => void handlePickFile()}
      />

      {pickedFile !== null && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.cancel")}
          onPress={handleRemovePicked}
          className="self-start active:opacity-70"
        >
          <View className="flex-row items-center gap-1.5">
            <X size={14} color={colors.danger} />
            <Text className="text-xs text-danger">{t("common.cancel")}</Text>
          </View>
        </Pressable>
      )}
    </ContactFormShell>
  );
}
