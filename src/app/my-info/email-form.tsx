import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { TextField } from "@/components/ui/TextField";
import { userEmailHooks } from "@/hooks/queries/contactInfoQueries";
import { useHaptic } from "@/hooks/useHaptic";
import { useTranslation } from "@/i18n";
import { toast } from "@/store/toastStore";
import { toApiError } from "@/services/client";
import {
  EMAIL_TYPE,
  type EmailType,
  type SaveUserEmailRequest,
} from "@/types/api";
import { isValidEmail } from "@/utils/validators";

import {
  ContactFormShell,
  TypeChipSelector,
  optionalText,
  parseEditingId,
} from "@/components/my-info/shared";

interface EmailFormState {
  readonly title: string;
  readonly description: string;
  readonly emailAddress: string;
  readonly emailType: EmailType;
}

const INITIAL_FORM: EmailFormState = {
  title: "",
  description: "",
  emailAddress: "",
  emailType: EMAIL_TYPE.Personal,
};

export default function EmailFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const haptic = useHaptic();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editingId = parseEditingId(id);

  const listQuery = userEmailHooks.useList();
  const saveMutation = userEmailHooks.useSave();

  const [form, setForm] = useState<EmailFormState>(INITIAL_FORM);
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
      description: item.description ?? "",
      emailAddress: item.emailAddress,
      emailType: item.emailType,
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

  const updateField = (patch: Partial<EmailFormState>) => {
    setForm((previous) => ({ ...previous, ...patch }));
  };

  const handleSubmit = async () => {
    const trimmedAddress = form.emailAddress.trim();

    if (!isValidEmail(trimmedAddress)) {
      haptic("error");
      toast.error(t("common.errorTitle"));
      return;
    }

    const data: SaveUserEmailRequest = {
      title: optionalText(form.title),
      description: optionalText(form.description),
      emailType: form.emailType,
      emailAddress: trimmedAddress,
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

  if (editingId !== null && !listQuery.isSuccess) {
    return null; // Wait for the cached list before deciding prefill vs. back.
  }

  const screenTitle =
    editingId === null ? t("myInfo.emails.formAddTitle") : t("myInfo.emails.formEditTitle");

  return (
    <ContactFormShell
      title={screenTitle}
      saveLabel={t("common.save")}
      isSaving={saveMutation.isPending}
      onSubmit={() => void handleSubmit()}
    >
      <TextField
        label={t("myInfo.emails.titleLabel")}
        value={form.title}
        onChangeText={(title) => updateField({ title })}
        placeholder={t("myInfo.emails.titleLabel")}
        hint={t("common.optional")}
      />
      <TextField
        label={t("myInfo.emails.descriptionLabel")}
        value={form.description}
        onChangeText={(description) => updateField({ description })}
        placeholder={t("myInfo.emails.descriptionLabel")}
        hint={t("common.optional")}
      />
      <TypeChipSelector<EmailType>
        label={t("myInfo.emails.typeLabel")}
        value={form.emailType}
        onChange={(emailType) => updateField({ emailType })}
        options={[
          { value: EMAIL_TYPE.Personal, label: t("myInfo.emails.typePersonal") },
          { value: EMAIL_TYPE.Work, label: t("myInfo.emails.typeWork") },
          { value: EMAIL_TYPE.Corporate, label: t("myInfo.emails.typeCorporate") },
          { value: EMAIL_TYPE.Support, label: t("myInfo.emails.typeSupport") },
          { value: EMAIL_TYPE.Sales, label: t("myInfo.emails.typeSales") },
          { value: EMAIL_TYPE.Other, label: t("myInfo.emails.typeOther") },
        ]}
      />
      <TextField
        label={t("myInfo.emails.addressLabel")}
        value={form.emailAddress}
        onChangeText={(emailAddress) => updateField({ emailAddress })}
        placeholder="ornek@mmcard.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </ContactFormShell>
  );
}
