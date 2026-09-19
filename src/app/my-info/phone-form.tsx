import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { TextField } from "@/components/ui/TextField";
import { userPhoneHooks } from "@/hooks/queries/contactInfoQueries";
import { useHaptic } from "@/hooks/useHaptic";
import { useTranslation } from "@/i18n";
import { toast } from "@/store/toastStore";
import { toApiError } from "@/services/client";
import {
  PHONE_NUMBER_TYPE,
  type PhoneNumberType,
  type SaveUserPhoneRequest,
} from "@/types/api";
import { isValidPhoneNumber } from "@/utils/validators";

import {
  ContactFormShell,
  formatPhoneNumber,
  TypeChipSelector,
  optionalText,
  parseEditingId,
  sanitizePhoneNumber,
} from "@/components/my-info/shared";

interface PhoneFormState {
  readonly title: string;
  readonly description: string;
  readonly phoneNumber: string;
  readonly phoneType: PhoneNumberType;
}

const INITIAL_FORM: PhoneFormState = {
  title: "",
  description: "",
  phoneNumber: "",
  phoneType: PHONE_NUMBER_TYPE.Mobile,
};

export default function PhoneFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const haptic = useHaptic();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editingId = parseEditingId(id);

  const listQuery = userPhoneHooks.useList();
  const saveMutation = userPhoneHooks.useSave();

  const [form, setForm] = useState<PhoneFormState>(INITIAL_FORM);
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
      phoneNumber: formatPhoneNumber(item.phoneNumber),
      phoneType: item.phoneNumberType,
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

  const updateField = (patch: Partial<PhoneFormState>) => {
    setForm((previous) => ({ ...previous, ...patch }));
  };

  const handleSubmit = async () => {
    const cleanedNumber = sanitizePhoneNumber(form.phoneNumber);

    if (!isValidPhoneNumber(cleanedNumber)) {
      haptic("error");
      toast.error(t("myInfo.phones.invalidNumber"));
      return;
    }

    const data: SaveUserPhoneRequest = {
      title: optionalText(form.title),
      description: optionalText(form.description),
      phoneNumberType: form.phoneType,
      phoneNumber: cleanedNumber,
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
    editingId === null ? t("myInfo.phones.formAddTitle") : t("myInfo.phones.formEditTitle");

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
      <TextField
        label={t("myInfo.phones.descriptionLabel")}
        value={form.description}
        onChangeText={(description) => updateField({ description })}
        placeholder={t("myInfo.phones.descriptionLabel")}
        hint={t("common.optional")}
      />
      <TypeChipSelector<PhoneNumberType>
        label={t("myInfo.phones.typeLabel")}
        value={form.phoneType}
        onChange={(phoneType) => updateField({ phoneType })}
        options={[
          { value: PHONE_NUMBER_TYPE.Mobile, label: t("myInfo.phones.typeMobile") },
          { value: PHONE_NUMBER_TYPE.Home, label: t("myInfo.phones.typeHome") },
          { value: PHONE_NUMBER_TYPE.Work, label: t("myInfo.phones.typeWork") },
        ]}
      />
      <TextField
        label={t("myInfo.phones.numberLabel")}
        value={form.phoneNumber}
        onChangeText={(phoneNumber) =>
          updateField({ phoneNumber: formatPhoneNumber(phoneNumber) })
        }
        placeholder="532 123 12 12"
        keyboardType="phone-pad"
        autoCorrect={false}
        maxLength={13}
      />
    </ContactFormShell>
  );
}
