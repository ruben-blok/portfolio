import { enContent } from "@/content/en";
import { nlContent } from "@/content/nl";
import type { Locale, SiteContent } from "@/content/types";

const contentByLocale: Record<Locale, SiteContent> = {
  nl: nlContent,
  en: enContent,
};

export function getContent(locale: Locale): SiteContent {
  return contentByLocale[locale];
}

export type { Locale, SiteContent } from "@/content/types";
