import { describe, expect, it } from "vitest";
import { LOCALES, MESSAGES, type Locale, type MessageKey } from "./messages";
import { isLocale, isRtl, localeLabel, t } from "./index";

describe("i18n dictionary integrity", () => {
  const keys = Object.keys(MESSAGES.en) as MessageKey[];

  it("defines every message key in every locale (no gaps)", () => {
    for (const locale of LOCALES) {
      const dict = MESSAGES[locale.code];
      for (const key of keys) {
        expect(dict[key], `${locale.code}.${key}`).toBeTruthy();
      }
    }
  });

  it("has no locale accidentally left in English (except en)", () => {
    for (const locale of LOCALES) {
      if (locale.code === "en") continue;
      expect(MESSAGES[locale.code].continue).not.toBe(MESSAGES.en.continue);
    }
  });
});

describe("t()", () => {
  it("returns the localized string", () => {
    expect(t("qaAsk", "es")).toBe("Buscar");
    expect(t("qaAsk", "hi")).toBe("खोजें");
  });

  it("falls back to English for an unknown locale", () => {
    expect(t("qaAsk", "xx" as Locale)).toBe(MESSAGES.en.qaAsk);
  });
});

describe("locale helpers", () => {
  it("identifies valid locales", () => {
    expect(isLocale("pt")).toBe(true);
    expect(isLocale("zz")).toBe(false);
  });

  it("flags Arabic as RTL and others as LTR", () => {
    expect(isRtl("ar")).toBe(true);
    expect(isRtl("en")).toBe(false);
  });

  it("builds a flag + label", () => {
    expect(localeLabel("fr")).toContain("Français");
    expect(localeLabel("zz" as Locale)).toBe("zz");
  });
});
