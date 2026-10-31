import { describe, expect, it } from "vitest";
import { getContent } from "@/content";
import {
  boundaryCamera,
  circleRadiusPixels,
  isValidPosition,
  openStreetMapUrl,
  pointCamera,
  ringCenter,
  worldCamera,
} from "@/lib/map-camera";

const pointsOfInterest = getContent("nl").pointsOfInterest;

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

  it("richt een gebied iets noordelijker dan het midden, op focusZoom", () => {
    const westland = pointsOfInterest.find((point) => point.precision === "boundary");
    expect(westland?.precision).toBe("boundary");
    if (westland?.precision !== "boundary") return;

    const center = ringCenter(westland.ring);
    const camera = boundaryCamera(westland);

    expect(camera.zoom).toBe(westland.focusZoom);
    expect(camera.pitch).toBe(0);
    expect(camera.center[0]).toBeCloseTo(center[0], 9);
    // Noordelijker, zodat de bovenkant van de outline vrij blijft van de canvasrand.
    expect(camera.center[1]).toBeGreaterThan(center[1]);
    expect(camera.center[1] - center[1]).toBeLessThan(0.01);
  });
});
