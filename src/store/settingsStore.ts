import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager, NativeModules, Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Language = "tr" | "en";

const SETTINGS_STORAGE_KEY = "mmc.settings";

/** Reads the device locale synchronously; empty string when unavailable. */
function getDeviceLocale(): string {
  if (Platform.OS === "ios") {
    const settings = NativeModules.SettingsManager?.settings as
      | { AppleLocale?: string; AppleLanguages?: string[] }
      | undefined;
    return settings?.AppleLocale ?? settings?.AppleLanguages?.[0] ?? "";
  }

  const constants = I18nManager.getConstants() as { localeIdentifier?: string };
  return constants.localeIdentifier ?? "";
}

/** Turkish devices start in Turkish, everything else starts in English. */
function resolveDefaultLanguage(): Language {
  return getDeviceLocale().toLowerCase().startsWith("tr") ? "tr" : "en";
}

interface SettingsState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: resolveDefaultLanguage(),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
