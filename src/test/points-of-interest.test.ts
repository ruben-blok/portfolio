import { describe, expect, it } from "vitest";
import { getContent } from "@/content";
import type { Locale } from "@/lib/locale";
import { isValidPosition, pointPosition } from "@/lib/map-camera";

const locales: Locale[] = ["nl", "en"];

describe.each(locales)("points of interest (%s)", (locale) => {
  const content = getContent(locale);
  const { pointsOfInterest, projects } = content;

  it("heeft unieke ids, geldige coördinaten en passende zoomgrenzen", () => {
    const ids = pointsOfInterest.map((point) => point.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const point of pointsOfInterest) {
      expect(point.label.trim()).not.toBe("");
      expect(point.location.trim()).not.toBe("");
      expect(point.relation.trim()).not.toBe("");
      expect(isValidPosition(pointPosition(point))).toBe(true);
      expect(point.focusZoom).toBeLessThanOrEqual(point.maxZoom);

      if (point.precision === "exact") expect(point.address.trim()).not.toBe("");
      else expect(point.radiusKm).toBeGreaterThan(0);
    }
  });

  it("verwijst alleen naar bestaande projecten", () => {
    const projectIds = new Set(projects.map((project) => project.id));

    for (const point of pointsOfInterest) {
      if (point.projectId) expect(projectIds.has(point.projectId)).toBe(true);
    }
  });
});

describe("points of interest in beide talen", () => {
  it("modelleert de school exact en Urbexium globaal", () => {
    const school = getContent("nl").pointsOfInterest.find(
      (point) => point.id === "techniek-college-schiedam",
    );
    const urbexium = getContent("nl").pointsOfInterest.find(
      (point) => point.id === "urbexium-germany",
    );

    expect(school?.precision).toBe("exact");
    if (school?.precision === "exact") {
      expect(school.address).toBe("Schiedamseweg 245, 3118 JB Schiedam");
      expect(school.position).toEqual([4.3832053, 51.9239476]);
    }

    expect(urbexium?.precision).toBe("approximate");
    expect(urbexium?.location).toBe("Duitsland");
    expect(urbexium?.relation).toBe("Gehost op een VPS");
    expect(urbexium?.maxZoom).toBeLessThanOrEqual(9);
    expect(JSON.stringify(urbexium)).not.toMatch(/strato/i);
  });

  it("vertaalt de locatieteksten maar houdt de coördinaten gelijk", () => {
    const nl = getContent("nl").pointsOfInterest;
    const en = getContent("en").pointsOfInterest;

    expect(en.map((point) => point.id)).toEqual(nl.map((point) => point.id));
    expect(en.map((point) => pointPosition(point))).toEqual(
      nl.map((point) => pointPosition(point)),
    );

    const enUrbexium = en.find((point) => point.id === "urbexium-germany");
    expect(enUrbexium?.location).toBe("Germany");
    expect(enUrbexium?.relation).toBe("Hosted on a VPS");
  });
});
