import type { Metadata, Viewport } from "next";
import { getContent } from "@/content";
import type { Locale } from "@/lib/locale";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ruben-blok.github.io/portfolio"
).replace(/\/+$/, "");

function localeUrl(locale: Locale) {
  return locale === "en" ? `${siteUrl}/en/` : `${siteUrl}/`;
}

export function buildMetadata(locale: Locale): Metadata {
  const content = getContent(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: content.meta.title,
    description: content.meta.description,
    alternates: {
      canonical: localeUrl(locale),
      languages: {
        "nl-NL": localeUrl("nl"),
        en: localeUrl("en"),
        "x-default": localeUrl("nl"),
      },
    },
    authors: [{ name: content.profile.name, url: "https://github.com/ruben-blok" }],
    openGraph: {
      type: "website",
      locale: content.meta.ogLocale,
      alternateLocale: locale === "nl" ? ["en_US"] : ["nl_NL"],
      url: localeUrl(locale),
      title: content.meta.title,
      description: content.meta.description,
    },
  };
}

export const siteViewport: Viewport = {
  themeColor: "#f7f6f1",
  colorScheme: "light",
};
