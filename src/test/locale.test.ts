import { describe, expect, it } from "vitest";
import {
  LOCALE_STORAGE_KEY,
  localeHref,
  localeRedirectScript,
  preferredLocale,
} from "@/lib/locale";

describe("taalkeuze", () => {
  it("laat een opgeslagen keuze voorgaan", () => {
    expect(preferredLocale("nl", ["en-US"])).toBe("nl");
    expect(preferredLocale("en", ["nl-NL"])).toBe("en");
    expect(preferredLocale("onbekend", ["nl-NL"])).toBe("nl");
  });

  it("kiest Nederlands als een van de browsertalen Nederlands is", () => {
    expect(preferredLocale(null, ["en-US", "nl-NL"])).toBe("nl");
    expect(preferredLocale(null, ["NL"])).toBe("nl");
  });

  it("kiest Engels voor een niet-Nederlandse browser", () => {
    expect(preferredLocale(null, ["en-US"])).toBe("en");
    expect(preferredLocale(null, ["de-DE", "fr-FR"])).toBe("en");
  });

  it("blijft Nederlands als de browsertaal onbekend is", () => {
    expect(preferredLocale(null, [])).toBe("nl");
    expect(preferredLocale(null, ["", "  "])).toBe("nl");
  });
});

describe("taalpaden", () => {
  it("bouwt paden met en zonder base path", () => {
    expect(localeHref("nl", "")).toBe("/");
    expect(localeHref("en", "")).toBe("/en/");
    expect(localeHref("nl", "/portfolio")).toBe("/portfolio/");
    expect(localeHref("en", "/portfolio/")).toBe("/portfolio/en/");
  });

  it("noemt de opslagsleutel en het Engelse pad in het redirectscript", () => {
    const script = localeRedirectScript("/portfolio");

    expect(script).toContain(LOCALE_STORAGE_KEY);
    expect(script).toContain('"/portfolio/en/"');
    expect(script).toContain("navigator.languages");
  });
});
