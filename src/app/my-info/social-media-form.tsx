import { AtSign, Link } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { FormFieldsSkeleton, TextField } from "@/components/ui";
import { colors } from "@/constants/theme";
import { userSocialMediaHooks } from "@/hooks/queries/contactInfoQueries";
import { useSocialPlatforms } from "@/hooks/queries/referenceQueries";
import { useHaptic } from "@/hooks/useHaptic";
import { useTranslation } from "@/i18n";
import { toast } from "@/store/toastStore";
import { toApiError } from "@/services/client";
import type { SaveUserSocialMediaRequest } from "@/types/api";

import {
  ContactFormShell,
  TypeChipSelector,
  optionalText,
  parseEditingId,
} from "@/components/my-info/shared";

interface SocialMediaFormState {
  readonly title: string;
  readonly username: string;
  readonly url: string;
  readonly platformId: number | null;
}

const INITIAL_FORM: SocialMediaFormState = {
  title: "",
  username: "",
  url: "",
  platformId: null,
};

export default function SocialMediaFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const haptic = useHaptic();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editingId = parseEditingId(id);

  const listQuery = userSocialMediaHooks.useList();
  const saveMutation = userSocialMediaHooks.useSave();
  const platformsQuery = useSocialPlatforms();

  const [form, setForm] = useState<SocialMediaFormState>(INITIAL_FORM);
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
    setForm({
      title: item.title ?? "",
      username: item.username ?? "",
      url: item.url,
      platformId: item.socialMediaPlatformId,
    });
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

  const updateField = (patch: Partial<SocialMediaFormState>) => {
    setForm((previous) => ({ ...previous, ...patch }));
  };

  const platformOptions = useMemo(
    () =>
      (platformsQuery.data ?? []).map((platform) => ({
        value: platform.id,
        label: platform.name,
      })),
    [platformsQuery.data],
  );

  // Literal URL preview composed from the platform's base URL (not translatable).
  const selectedPlatformBaseUrl =
    form.platformId === null
      ? null
      : platformsQuery.data?.find((platform) => platform.id === form.platformId)?.baseUrl ?? null;
  const urlHint =
    selectedPlatformBaseUrl !== null && selectedPlatformBaseUrl.length > 0
      ? `${selectedPlatformBaseUrl}${form.username.trim()}`
      : undefined;

  const handleSubmit = async () => {
    const selectedPlatformId = form.platformId;

    if (selectedPlatformId === null) {
      haptic("error");
      toast.error(t("common.errorTitle"));
      return;
    }

    const trimmedUrl = form.url.trim();
    if (trimmedUrl.length === 0) {
      haptic("error");
      toast.error(t("common.errorTitle"));
      return;
    }

    const data: SaveUserSocialMediaRequest = {
      title: optionalText(form.title),
      username: optionalText(form.username),
      url: trimmedUrl,
      socialMediaPlatformId: selectedPlatformId,
    };

    try {
      await saveMutation.mutateAsync({ id: editingId, data });
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
        title={t("myInfo.socials.formEditTitle")}
        saveLabel={t("common.save")}
        isSaving={false}
        onSubmit={() => {}}
      >
        <FormFieldsSkeleton count={4} />
      </ContactFormShell>
    );
  }

  if (editingId !== null && !listQuery.isSuccess) {
    return null; // Wait for the cached list before deciding prefill vs. back.
  }

  const screenTitle =
    editingId === null ? t("myInfo.socials.formAddTitle") : t("myInfo.socials.formEditTitle");

  return (
    <ContactFormShell
      title={screenTitle}
      saveLabel={t("common.save")}
      isSaving={saveMutation.isPending}
      onSubmit={() => void handleSubmit()}
    >
      <TextField
        label={t("myInfo.phones.titleLabel")}
        value={form.title}
        onChangeText={(title) => updateField({ title })}
        placeholder={t("myInfo.phones.titleLabel")}
        hint={t("common.optional")}
      />
      <TypeChipSelector<number>
        label={t("myInfo.socials.platformLabel")}
        value={form.platformId}
        onChange={(platformId) => updateField({ platformId })}
        options={platformOptions}
      />
      <TextField
        label={t("myInfo.socials.usernameLabel")}
        value={form.username}
        onChangeText={(username) => updateField({ username })}
        placeholder={t("myInfo.socials.usernameLabel")}
        hint={t("common.optional")}
        icon={<AtSign size={18} color={colors.faint} />}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextField
        label={t("myInfo.socials.urlLabel")}
        value={form.url}
        onChangeText={(url) => updateField({ url })}
        placeholder="https://..."
        hint={urlHint}
        icon={<Link size={18} color={colors.faint} />}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </ContactFormShell>
  );
}
