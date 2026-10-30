import { describe, expect, it } from "vitest";
import { getContent } from "@/content";
import type { Locale } from "@/lib/locale";

const locales: Locale[] = ["nl", "en"];

describe.each(locales)("projectgegevens (%s)", (locale) => {
  const { projects } = getContent(locale);

  it("geeft elk project een titel, tagline, samenvatting en stack", () => {
    for (const project of projects) {
      expect(project.title.trim(), project.id).not.toBe("");
      expect(project.tagline.trim(), project.id).not.toBe("");
      expect(project.summary.trim(), project.id).not.toBe("");
      expect(project.stack.length, project.id).toBeGreaterThan(0);
    }
  });

  it("gebruikt unieke id's", () => {
    const ids = projects.map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("linkt Urbexium naar het huidige domein", () => {
    const urbexium = projects.find((project) => project.id === "urbexium");

    expect(urbexium?.href).toBe("https://urbexium.com");
  });

  it("koppelt elke externe link aan een label en een https-url", () => {
    for (const project of projects) {
      if (!project.href) {
        expect(project.linkLabel, project.id).toBeUndefined();
        continue;
      }

      expect(project.href, project.id).toMatch(/^https:\/\//);
      expect(project.linkLabel?.trim(), project.id).not.toBe("");
    }
  });

  it("gebruikt geen dubbele projectlinks", () => {
    const hrefs = projects.flatMap((project) => (project.href ? [project.href] : []));
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});

describe("projectgegevens in beide talen", () => {
  it("houdt dezelfde projecten en technische gegevens aan", () => {
    const nl = getContent("nl").projects;
    const en = getContent("en").projects;

    expect(en.map((project) => project.id)).toEqual(nl.map((project) => project.id));
    expect(en.map((project) => project.href)).toEqual(nl.map((project) => project.href));
    expect(en.map((project) => project.stack)).toEqual(nl.map((project) => project.stack));
  });
});
