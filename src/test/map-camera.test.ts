import { describe, expect, it } from "vitest";
import { pointsOfInterest } from "@/data/points-of-interest";
import {
  circleRadiusPixels,
  isValidPosition,
  openStreetMapUrl,
  pointCamera,
  worldCamera,
} from "@/lib/map-camera";

describe("kaartcamera", () => {
  it("gebruikt een compactere wereldcamera op mobiel", () => {
    expect(worldCamera(true).zoom).toBeLessThan(worldCamera(false).zoom);
    expect(worldCamera(true).pitch).toBe(0);
  });

  it("valideert geografische posities", () => {
    expect(isValidPosition([4.38, 51.92])).toBe(true);
    expect(isValidPosition([181, 51.92])).toBe(false);
    expect(isValidPosition([4.38, 91])).toBe(false);
  });

  it("kantelt alleen naar een exacte locatie", () => {
    const school = pointsOfInterest.find((point) => point.precision === "exact");
    const urbexium = pointsOfInterest.find((point) => point.precision === "approximate");

    expect(school && pointCamera(school).pitch).toBe(38);
    expect(urbexium && pointCamera(urbexium).pitch).toBe(0);
  });

  it("schaalt de schermstraal van een globale locatie mee met de zoom", () => {
    expect(circleRadiusPixels(25, 51.2, 8.5)).toBeCloseTo(circleRadiusPixels(25, 51.2, 7.5) * 2, 6);
    expect(circleRadiusPixels(25, 51.2277, 7.5)).toBeCloseTo(92.31, 1);
  });

  it("gebruikt alleen voor exacte locaties een OpenStreetMap-marker", () => {
    const school = pointsOfInterest.find((point) => point.precision === "exact");
    const urbexium = pointsOfInterest.find((point) => point.precision === "approximate");

    expect(school && openStreetMapUrl(school)).toContain("mlat=");
    expect(urbexium && openStreetMapUrl(urbexium)).not.toContain("mlat=");
  });
});
