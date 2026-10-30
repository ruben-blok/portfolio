export type Locale = "nl" | "en";

export const DEFAULT_LOCALE: Locale = "nl";
export const LOCALE_STORAGE_KEY = "portfolio-locale";

/** Picks the stored language, then Dutch when any browser language is Dutch. */
export function preferredLocale(stored: string | null, languages: readonly string[]): Locale {
  if (stored === "nl" || stored === "en") return stored;

  const normalized = languages.map((language) => language.trim().toLowerCase()).filter(Boolean);
  if (normalized.length === 0) return DEFAULT_LOCALE;

  return normalized.some((language) => language.startsWith("nl")) ? "nl" : "en";
}

/** Builds a locale path, including the Next.js base path when configured. */
export function localeHref(
  locale: Locale,
  basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "",
): string {
  const prefix = basePath.replace(/\/+$/, "");
  return locale === "en" ? `${prefix}/en/` : `${prefix}/`;
}

/**
 * Inline script for the Dutch page. It runs before the page paints, so a
 * non-Dutch visitor never sees the Dutch copy first. Keep the detection in
 * sync with `preferredLocale`.
 */
export function localeRedirectScript(basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""): string {
  const englishPath = localeHref("en", basePath);

  return `(() => {
  try {
    const key = ${JSON.stringify(LOCALE_STORAGE_KEY)};
    const stored = window.localStorage.getItem(key);
    if (stored === "nl") return;
    if (stored === "en") {
      window.location.replace(${JSON.stringify(englishPath)});
      return;
    }
    const languages = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || ""];
    const speaksDutch = languages.some((language) => language.toLowerCase().startsWith("nl"));
    if (!speaksDutch && languages.some(Boolean)) {
      window.location.replace(${JSON.stringify(englishPath)});
    }
  } catch {
    // Stay on the Dutch page when storage or language detection is unavailable.
  }
})();`;
}
