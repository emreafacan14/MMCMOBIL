import { ChevronDown } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { FormFieldsSkeleton, TextField } from "@/components/ui";
import { colors } from "@/constants/theme";
import { userAddressHooks } from "@/hooks/queries/contactInfoQueries";
import { useDistricts, useCities, useNeighborhoods } from "@/hooks/queries/referenceQueries";
import { useHaptic } from "@/hooks/useHaptic";
import { useTranslation } from "@/i18n";
import { toast } from "@/store/toastStore";
import { toApiError } from "@/services/client";
import {
  ADDRESS_TYPE,
  type AddressType,
  type SaveUserAddressRequest,
} from "@/types/api";

import {
  ContactFormShell,
  OptionPickerSheet,
  TypeChipSelector,
  type PickerOption,
  optionalText,
  parseEditingId,
  toIntOrNull,
} from "@/components/my-info/shared";

type PickerKind = "city" | "district" | "neighborhood";

interface AddressFormState {
  readonly title: string;
  readonly description: string;
  readonly addressType: AddressType;
  readonly fullAddress: string;
  readonly streetName: string;
  readonly buildingName: string;
  readonly buildingNumber: string;
  readonly floor: string;
  readonly doorNumber: string;
  readonly zipCode: string;
}

const INITIAL_FORM: AddressFormState = {
  title: "",
  description: "",
  addressType: ADDRESS_TYPE.Home,
  fullAddress: "",
  streetName: "",
  buildingName: "",
  buildingNumber: "",
  floor: "",
  doorNumber: "",
  zipCode: "",
};

function findSelectedLabel(
  options: readonly PickerOption[],
  selectedId: number | null,
): string | null {
  if (selectedId === null) {
    return null;
  }

  return options.find((option) => option.id === selectedId)?.label ?? null;
}

interface SelectionFieldProps {
  readonly label: string;
  readonly value: string | null;
  readonly placeholder: string;
  readonly disabled?: boolean;
  readonly onPress: () => void;
}

function SelectionField({
  label,
  value,
  placeholder,
  disabled = false,
  onPress,
}: SelectionFieldProps) {
  const haptic = useHaptic();

  const handlePress = () => {
    if (disabled) {
      return;
    }
    haptic("light");
    onPress();
  };

  return (
    <View className={`gap-y-2 ${disabled ? "opacity-40" : ""}`}>
      <Text className="font-inter-medium text-sm text-muted">{label}</Text>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        className={`flex-row items-center justify-between rounded-2xl border px-4 py-3.5 ${
          disabled
            ? "border-line/40 bg-elevated/40"
            : "border-line bg-elevated/80 active:opacity-70"
        }`}
      >
        <Text
          numberOfLines={1}
          className={
            value === null || disabled
              ? "flex-1 text-sm text-faint"
              : "flex-1 text-sm text-ink"
          }
        >
          {value ?? placeholder}
        </Text>
        <ChevronDown size={16} color={disabled ? colors.faint : colors.muted} />
      </Pressable>
    </View>
  );
}

export default function AddressFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const haptic = useHaptic();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editingId = parseEditingId(id);

  const listQuery = userAddressHooks.useList();
  const saveMutation = userAddressHooks.useSave();

  const [form, setForm] = useState<AddressFormState>(INITIAL_FORM);
  const [cityId, setCityId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [neighborhoodId, setNeighborhoodId] = useState<number | null>(null);
  const [whichPickerOpen, setWhichPickerOpen] = useState<PickerKind | null>(null);

  const initializedForRef = useRef<number | null>(null);
  const didHandleMissingRef = useRef(false);

  const citiesQuery = useCities();
  const districtsQuery = useDistricts(cityId === null ? undefined : cityId);
  const neighborhoodsQuery = useNeighborhoods(districtId === null ? undefined : districtId);

  const item =
    editingId === null ? undefined : listQuery.data?.find((entry) => entry.id === editingId);

  const toOptions = (entries: { id: number; name: string }[] | undefined): PickerOption[] =>
    (entries ?? []).map((entry) => ({ id: entry.id, label: entry.name }));
  const cityOptions = useMemo(() => toOptions(citiesQuery.data), [citiesQuery.data]);
  const districtOptions = useMemo(() => toOptions(districtsQuery.data), [districtsQuery.data]);
  const neighborhoodOptions = useMemo(
    () => toOptions(neighborhoodsQuery.data),
    [neighborhoodsQuery.data],
  );

  // Prefill once per edited record; never clobber in-progress edits.
  useEffect(() => {
    if (item === undefined || initializedForRef.current === item.id) {
      return;
    }

    initializedForRef.current = item.id;
    setForm({
      title: item.title ?? "",
      description: item.description ?? "",
      addressType: item.addressType,
      fullAddress: item.fullAddress ?? "",
      streetName: item.streetName ?? "",
      buildingName: item.buildingName ?? "",
      buildingNumber: item.buildingNumber === null ? "" : String(item.buildingNumber),
      floor: item.floor === null ? "" : String(item.floor),
      doorNumber: item.doorNumber === null ? "" : String(item.doorNumber),
      zipCode: item.zipCode === null ? "" : String(item.zipCode),
    });
    setCityId(item.cityId);
    setDistrictId(item.districtId);
    setNeighborhoodId(item.neighborhoodId);
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

  const updateField = (patch: Partial<AddressFormState>) => {
    setForm((previous) => ({ ...previous, ...patch }));
  };

  const closePicker = () => {
    setWhichPickerOpen(null);
  };

  const handleCitySelect = (selectedId: number) => {
    setCityId(selectedId);
    setDistrictId(null); // Cascade reset: new city invalidates the old district.
    setNeighborhoodId(null);
    closePicker();
  };

  const handleDistrictSelect = (selectedId: number) => {
    setDistrictId(selectedId);
    setNeighborhoodId(null);
    closePicker();
  };

  const handleNeighborhoodSelect = (selectedId: number) => {
    setNeighborhoodId(selectedId);
    closePicker();
  };

  const handleSubmit = async () => {
    const selectedNeighborhoodId = neighborhoodId;

    if (cityId === null || districtId === null || selectedNeighborhoodId === null) {
      haptic("error");
      toast.error(t("common.errorTitle"));
      return;
    }

    const data: SaveUserAddressRequest = {
      title: optionalText(form.title),
      description: optionalText(form.description),
      addressType: form.addressType,
      fullAddress: optionalText(form.fullAddress),
      buildingNumber: toIntOrNull(form.buildingNumber),
      buildingName: optionalText(form.buildingName),
      floor: toIntOrNull(form.floor),
      doorNumber: toIntOrNull(form.doorNumber),
      streetName: optionalText(form.streetName),
      zipCode: toIntOrNull(form.zipCode),
      neighborhoodId: selectedNeighborhoodId,
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
        title={t("myInfo.addresses.formEditTitle")}
        saveLabel={t("common.save")}
        isSaving={false}
        onSubmit={() => {}}
      >
        <FormFieldsSkeleton count={6} />
      </ContactFormShell>
    );
  }

  if (editingId !== null && !listQuery.isSuccess) {
    return null; // Wait for the cached list before deciding prefill vs. back.
  }

  const screenTitle =
    editingId === null ? t("myInfo.addresses.formAddTitle") : t("myInfo.addresses.formEditTitle");

  return (
    <ContactFormShell
      title={screenTitle}
      saveLabel={t("common.save")}
      isSaving={saveMutation.isPending}
      onSubmit={() => void handleSubmit()}
    >
      <TextField
        label={t("myInfo.addresses.titleLabel")}
        value={form.title}
        onChangeText={(title) => updateField({ title })}
        placeholder={t("myInfo.addresses.titleLabel")}
        hint={t("common.optional")}
      />
      <TextField
        label={t("myInfo.addresses.descriptionLabel")}
        value={form.description}
        onChangeText={(description) => updateField({ description })}
        placeholder={t("myInfo.addresses.descriptionLabel")}
        hint={t("common.optional")}
      />
      <TypeChipSelector<AddressType>
        label={t("myInfo.addresses.typeLabel")}
        value={form.addressType}
        onChange={(addressType) => updateField({ addressType })}
        options={[
          { value: ADDRESS_TYPE.Home, label: t("myInfo.addresses.typeHome") },
          { value: ADDRESS_TYPE.Work, label: t("myInfo.addresses.typeWork") },
          { value: ADDRESS_TYPE.Office, label: t("myInfo.addresses.typeOffice") },
          { value: ADDRESS_TYPE.Branch, label: t("myInfo.addresses.typeBranch") },
          { value: ADDRESS_TYPE.Other, label: t("myInfo.addresses.typeOther") },
        ]}
      />

      <View className="gap-y-3">
        <SelectionField
          label={t("myInfo.addresses.cityLabel")}
          value={findSelectedLabel(cityOptions, cityId)}
          placeholder={t("myInfo.addresses.selectCity")}
          onPress={() => setWhichPickerOpen("city")}
        />
        <SelectionField
          label={t("myInfo.addresses.districtLabel")}
          value={findSelectedLabel(districtOptions, districtId)}
          placeholder={t("myInfo.addresses.selectDistrict")}
          disabled={cityId === null}
          onPress={() => setWhichPickerOpen("district")}
        />
        <SelectionField
          label={t("myInfo.addresses.neighborhoodLabel")}
          value={findSelectedLabel(neighborhoodOptions, neighborhoodId)}
          placeholder={t("myInfo.addresses.selectNeighborhood")}
          disabled={districtId === null}
          onPress={() => setWhichPickerOpen("neighborhood")}
        />
      </View>

      <TextField
        label={t("myInfo.addresses.streetLabel")}
        value={form.streetName}
        onChangeText={(streetName) => updateField({ streetName })}
        placeholder={t("myInfo.addresses.streetLabel")}
        hint={t("common.optional")}
      />
      <TextField
        label={t("myInfo.addresses.buildingNameLabel")}
        value={form.buildingName}
        onChangeText={(buildingName) => updateField({ buildingName })}
        placeholder={t("myInfo.addresses.buildingNameLabel")}
        hint={t("common.optional")}
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <TextField
            label={t("myInfo.addresses.buildingNumberLabel")}
            value={form.buildingNumber}
            onChangeText={(buildingNumber) => updateField({ buildingNumber })}
            placeholder={t("myInfo.addresses.buildingNumberLabel")}
            keyboardType="number-pad"
          />
        </View>
        <View className="flex-1">
          <TextField
            label={t("myInfo.addresses.floorLabel")}
            value={form.floor}
            onChangeText={(floor) => updateField({ floor })}
            placeholder={t("myInfo.addresses.floorLabel")}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <TextField
            label={t("myInfo.addresses.doorNumberLabel")}
            value={form.doorNumber}
            onChangeText={(doorNumber) => updateField({ doorNumber })}
            placeholder={t("myInfo.addresses.doorNumberLabel")}
            keyboardType="number-pad"
          />
        </View>
        <View className="flex-1">
          <TextField
            label={t("myInfo.addresses.zipLabel")}
            value={form.zipCode}
            onChangeText={(zipCode) => updateField({ zipCode })}
            placeholder={t("myInfo.addresses.zipLabel")}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <TextField
        label={t("myInfo.addresses.fullAddressLabel")}
        value={form.fullAddress}
        onChangeText={(fullAddress) => updateField({ fullAddress })}
        placeholder={t("myInfo.addresses.fullAddressLabel")}
        multiline
      />

      <OptionPickerSheet
        visible={whichPickerOpen === "city"}
        title={t("myInfo.addresses.selectCity")}
        options={cityOptions}
        isLoading={citiesQuery.isLoading}
        selectedId={cityId}
        onSelect={handleCitySelect}
        onClose={closePicker}
      />
      <OptionPickerSheet
        visible={whichPickerOpen === "district" && cityId !== null}
        title={t("myInfo.addresses.selectDistrict")}
        options={districtOptions}
        isLoading={districtsQuery.isLoading}
        selectedId={districtId}
        onSelect={handleDistrictSelect}
        onClose={closePicker}
      />
      <OptionPickerSheet
        visible={whichPickerOpen === "neighborhood" && districtId !== null}
        title={t("myInfo.addresses.selectNeighborhood")}
        options={neighborhoodOptions}
        isLoading={neighborhoodsQuery.isLoading}
        selectedId={neighborhoodId}
        onSelect={handleNeighborhoodSelect}
        onClose={closePicker}
      />
    </ContactFormShell>
  );
}
