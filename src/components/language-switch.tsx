"use client";

import type { LanguageSwitchCopy } from "@/content/types";
import { LOCALE_STORAGE_KEY, localeHref } from "@/lib/locale";

export function LanguageSwitch({ copy }: { copy: LanguageSwitchCopy }) {
  const rememberLocale = () => {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, copy.locale);
    } catch {
      // Storage can be unavailable, for example in private browsing modes.
    }
  };

  return (
    <a
      href={localeHref(copy.locale)}
      hrefLang={copy.locale}
      lang={copy.locale}
      aria-label={copy.ariaLabel}
      onClick={rememberLocale}
      className="inline-flex min-h-11 items-center text-label font-medium text-soft underline decoration-rule underline-offset-4 transition-[color,text-decoration-color] duration-200 ease-settle hover:text-forest hover:decoration-forest md:min-h-0 md:py-1 motion-reduce:transition-none"
    >
      {copy.label}
    </a>
  );
}
