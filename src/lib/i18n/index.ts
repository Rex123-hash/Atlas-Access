import { LOCALES, MESSAGES, type Locale, type MessageKey } from "./messages";

export { LOCALES, type Locale, type MessageKey } from "./messages";
export * from "./templates";

const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return LOCALES.some((l) => l.code === value);
}

/** Translate a key for a locale, falling back to English then to the key. */
export function t(key: MessageKey, locale: Locale): string {
  return MESSAGES[locale]?.[key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? key;
}

export function isRtl(locale: Locale): boolean {
  return LOCALES.find((l) => l.code === locale)?.dir === "rtl";
}

export function localeLabel(locale: Locale): string {
  const entry = LOCALES.find((l) => l.code === locale);
  return entry ? entry.label : locale;
}
