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
      if (point.precision === "approximate") expect(point.radiusKm).toBeGreaterThan(0);
      if (point.precision === "boundary") {
        // Een vlak heeft geen straal maar een ring: minimaal een driehoek, gesloten,
        // en elk punt moet een geldige coördinaat zijn.
        expect(point.ring.length).toBeGreaterThan(3);
        expect(point.ring[0]).toEqual(point.ring[point.ring.length - 1]);
        for (const position of point.ring) expect(isValidPosition(position)).toBe(true);
      }
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

  it("modelleert Westland als gesloten gemeentegrens in plaats van een rondje", () => {
    const nl = getContent("nl").pointsOfInterest.find((point) => point.id === "westland");
    const en = getContent("en").pointsOfInterest.find((point) => point.id === "westland");

    expect(nl?.precision).toBe("boundary");
    expect(nl).not.toHaveProperty("radiusKm");
    expect(nl?.label).toBe("Westland");
    expect(nl?.location).toBe("Nederland");
    expect(nl?.relation).toBe("Hier woon ik");
    expect(en?.location).toBe("Netherlands");
    expect(en?.relation).toBe("This is where I live");

    if (nl?.precision === "boundary" && en?.precision === "boundary") {
      expect(nl.ring.length).toBeGreaterThan(100);
      expect(en.ring).toEqual(nl.ring);
      expect(en.center).toEqual(nl.center);
      // Het middelpunt ligt in Westland, niet op de campus in Schiedam.
      expect(nl.center[0]).toBeGreaterThan(4.11);
      expect(nl.center[0]).toBeLessThan(4.31);
      expect(nl.center[1]).toBeGreaterThan(51.94);
      expect(nl.center[1]).toBeLessThan(52.06);

      const lons = nl.ring.map(([longitude]) => longitude);
      const lats = nl.ring.map(([, latitude]) => latitude);
      // De officiële gemeente is ~13,7 km oost-west en ~13,4 km noord-zuid; op deze
      // breedte is 1° lengtegraad ~68,5 km en 1° breedtegraad ~111 km.
      expect((Math.max(...lons) - Math.min(...lons)) * 68.5).toBeGreaterThan(12);
      expect((Math.max(...lats) - Math.min(...lats)) * 111).toBeGreaterThan(12);
    }
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
