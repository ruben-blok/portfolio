import { describe, expect, it } from "vitest";
import { pointsOfInterest } from "@/data/points-of-interest";
import { projects } from "@/data/projects";
import { isValidPosition, pointPosition } from "@/lib/map-camera";

describe("points of interest", () => {
  it("heeft unieke ids, geldige coördinaten en passende zoomgrenzen", () => {
    const ids = pointsOfInterest.map((point) => point.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const point of pointsOfInterest) {
      expect(point.label).not.toBe("");
      expect(point.location).not.toBe("");
      expect(point.relation).not.toBe("");
      expect(isValidPosition(pointPosition(point))).toBe(true);
      expect(point.focusZoom).toBeLessThanOrEqual(point.maxZoom);

      if (point.precision === "exact") expect(point.address).not.toBe("");
      else expect(point.radiusKm).toBeGreaterThan(0);
    }
  });

  it("verwijst alleen naar bestaande projecten", () => {
    const projectIds = new Set(projects.map((project) => project.id));

    for (const point of pointsOfInterest) {
      if (point.projectId) expect(projectIds.has(point.projectId)).toBe(true);
    }
  });

  it("modelleert de school exact en Urbexium globaal", () => {
    const school = pointsOfInterest.find((point) => point.id === "techniek-college-schiedam");
    const urbexium = pointsOfInterest.find((point) => point.id === "urbexium-germany");

    expect(school?.precision).toBe("exact");
    if (school?.precision === "exact") {
      expect(school.address).toBe("Schiedamseweg 245, 3118 JB Schiedam");
      expect(school.position).toEqual([4.3832053, 51.9239476]);
    }

    expect(urbexium?.precision).toBe("approximate");
    expect(urbexium?.location).toBe("Germany");
    expect(urbexium?.relation).toBe("Gehost op een VPS");
    expect(urbexium?.maxZoom).toBeLessThanOrEqual(9);
    expect(JSON.stringify(urbexium)).not.toMatch(/strato/i);
  });
});
