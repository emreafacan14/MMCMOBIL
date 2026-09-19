import { createContext, useContext, useMemo, type ReactNode } from "react";
import { tr, type Dictionary } from "@/i18n/dictionaries/tr";
import { en } from "@/i18n/dictionaries/en";
import { useSettingsStore, type Language } from "@/store/settingsStore";

const DICTIONARIES: Record<Language, Dictionary> = { tr, en };

type JoinPaths<T> = T extends string
  ? T
  : {
      [K in keyof T & string]: T[K] extends string
        ? K
        : `${K}.${JoinPaths<T[K]>}`;
    }[keyof T & string];

/** Dot path into the dictionary, e.g. "auth.login.title". */
export type TranslationKey = JoinPaths<Dictionary>;

type TranslateParams = Record<string, string | number>;

interface I18nContextValue {
  language: Language;
  t: (key: TranslationKey, params?: TranslateParams) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Walks a dot path; returns the key itself when a translation is missing. */
function resolve(dictionary: unknown, key: string): string {
  let current: unknown = dictionary;

  for (const part of key.split(".")) {
    if (!isRecord(current) || !(part in current)) {
      return key;
    }

    current = current[part];
  }

  return typeof current === "string" ? current : key;
}

function interpolate(template: string, params: TranslateParams | undefined): string {
  if (params === undefined) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, param: string) =>
    param in params ? String(params[param]) : match,
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const language = useSettingsStore((state) => state.language);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      t: (key, params) =>
        interpolate(resolve(DICTIONARIES[language], key), params),
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);

  if (context === null) {
    throw new Error("useTranslation must be used inside I18nProvider");
  }

  return context;
}
