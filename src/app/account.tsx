/**
 * My Account: profile photo upload plus name/surname editing. Photo changes
 * upload immediately on pick; text changes go through the save button.
 */

import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Camera } from "lucide-react-native";

import { Avatar } from "@/components/ui/Avatar";
import { TextField } from "@/components/ui/TextField";
import { colors } from "@/constants/theme";
import {
  useMyProfile,
  useUpdateMyProfile,
  useUpdateProfileImage,
} from "@/hooks/queries/profileQueries";
import { useHaptic } from "@/hooks/useHaptic";
import { useTranslation } from "@/i18n";
import { toast } from "@/store/toastStore";
import { toApiError } from "@/services/client";
import { isWithinUploadLimit, pickImageFromLibrary } from "@/utils/filePicking";

import { ContactFormShell } from "@/components/my-info/shared";

export default function AccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const haptic = useHaptic();
  const profileQuery = useMyProfile();
  const updateProfileMutation = useUpdateMyProfile();
  const updatePhotoMutation = useUpdateProfileImage();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");

  // Prefill once per profile load; never clobber in-progress edits.
  const initializedRef = useRef(false);

  useEffect(() => {
    const profile = profileQuery.data;
    if (profile === undefined || initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    setName(profile.name);
    setSurname(profile.surname);
  }, [profileQuery.data]);

  const handleChangePhoto = async () => {
    haptic("light");

    try {
      const picked = await pickImageFromLibrary();

      if (picked === null) {
        return;
      }

      if (!isWithinUploadLimit(picked)) {
        haptic("error");
        toast.error(t("account.photoTooLarge"));
        return;
      }

      await updatePhotoMutation.mutateAsync(picked);
      haptic("success");
      toast.success(t("toast.updated"));
    } catch (error) {
      haptic("error");
      toast.error(toApiError(error).message);
    }
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedSurname = surname.trim();

    if (trimmedName.length === 0 || trimmedSurname.length === 0) {
      haptic("error");
      toast.error(t("auth.feedback.requiredField"));
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        name: trimmedName,
        surname: trimmedSurname,
      });
      haptic("success");
      toast.success(t("toast.saved"));
      router.back();
    } catch (error) {
      haptic("error");
      toast.error(toApiError(error).message);
    }
  };

  const profile = profileQuery.data;

  return (
    <ContactFormShell
      title={t("account.title")}
      subtitle={t("account.subtitle")}
      saveLabel={t("common.save")}
      isSaving={updateProfileMutation.isPending}
      onSubmit={() => void handleSubmit()}
    >
      <View className="items-center gap-y-3 py-2">
        <Pressable
          onPress={() => void handleChangePhoto()}
          disabled={updatePhotoMutation.isPending}
          accessibilityRole="button"
          accessibilityLabel={
            profile?.profileImagePath
              ? t("account.changePhoto")
              : t("account.addPhoto")
          }
          className={`active:opacity-70 ${updatePhotoMutation.isPending ? "opacity-50" : ""}`}
        >
          <Avatar
            imagePath={profile?.profileImagePath ?? null}
            name={name}
            surname={surname}
            size={96}
          />
          <View className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full border border-line bg-elevated">
            <Camera size={15} color={colors.primaryStrong} />
          </View>
        </Pressable>
        <Text className="text-sm text-muted">
          {profile?.profileImagePath ? t("account.changePhoto") : t("account.addPhoto")}
        </Text>
      </View>

      <TextField
        label={t("account.nameLabel")}
        value={name}
        onChangeText={setName}
        placeholder={t("account.nameLabel")}
        autoCapitalize="words"
      />
      <TextField
        label={t("account.surnameLabel")}
        value={surname}
        onChangeText={setSurname}
        placeholder={t("account.surnameLabel")}
        autoCapitalize="words"
      />

      <TextField
        label={t("account.emailLabel")}
        value={profile?.email ?? ""}
        onChangeText={() => {}}
        editable={false}
      />
    </ContactFormShell>
  );
}
