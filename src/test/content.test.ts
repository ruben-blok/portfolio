import { describe, expect, it } from "vitest";
import { getContent } from "@/content";
import { buildMetadata } from "@/content/metadata";
import type { Locale } from "@/lib/locale";

const locales: Locale[] = ["nl", "en"];

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(collectStrings);
  return [];
}

describe.each(locales)("content (%s)", (locale) => {
  const content = getContent(locale);

  it("heeft geen lege teksten", () => {
    for (const value of collectStrings(content)) {
      expect(value.trim(), locale).not.toBe("");
    }
  });

  it("heeft unieke ids voor projecten, locaties, stackgroepen en opleidingen", () => {
    expect(new Set(content.projects.map((project) => project.id)).size).toBe(
      content.projects.length,
    );
    expect(new Set(content.pointsOfInterest.map((point) => point.id)).size).toBe(
      content.pointsOfInterest.length,
    );
    expect(new Set(content.stackGroups.map((group) => group.id)).size).toBe(
      content.stackGroups.length,
    );
    expect(new Set(content.education.map((entry) => entry.id)).size).toBe(content.education.length);
  });
});

describe("content in beide talen", () => {
  it("houdt dezelfde technische ids aan", () => {
    const nl = getContent("nl");
    const en = getContent("en");

    expect(en.projects.map((project) => project.id)).toEqual(
      nl.projects.map((project) => project.id),
    );
    expect(en.pointsOfInterest.map((point) => point.id)).toEqual(
      nl.pointsOfInterest.map((point) => point.id),
    );
    expect(en.stackGroups.map((group) => group.id)).toEqual(
      nl.stackGroups.map((group) => group.id),
    );
    expect(en.education.map((entry) => entry.id)).toEqual(nl.education.map((entry) => entry.id));
    expect(en.navigation.map((item) => item.href)).not.toEqual(
      nl.navigation.map((item) => item.href),
    );
  });

  it("bouwt metadata met canonieke en hreflang-urls", () => {
    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://ruben-blok.github.io/portfolio"
    ).replace(/\/+$/, "");
    const nl = buildMetadata("nl");
    const en = buildMetadata("en");

    expect(nl.description).not.toBe(en.description);
    expect(String(nl.alternates?.canonical)).toBe(`${siteUrl}/`);
    expect(String(en.alternates?.canonical)).toBe(`${siteUrl}/en/`);
    expect(String(nl.alternates?.languages?.["nl-NL"])).toBe(`${siteUrl}/`);
    expect(String(nl.alternates?.languages?.en)).toBe(`${siteUrl}/en/`);
    expect(nl.openGraph?.locale).toBe("nl_NL");
    expect(en.openGraph?.locale).toBe("en_US");
  });
});
