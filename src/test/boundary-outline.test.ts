import { describe, expect, it } from "vitest";
import { getContent } from "@/content";
import type { Position } from "@/data/points-of-interest";
import {
  MIN_OUTLINE_ZOOM,
  projectRing,
  ringIsClosed,
  ringIsOnScreen,
  type ScreenPoint,
} from "@/lib/boundary-outline";

/** Web Mercator projection like `map.project`, for a 1440x721 container at `zoom`. */
function mercator(zoom: number, center: Position = [4.21, 52.0]) {
  const worldSize = 512 * 2 ** zoom;
  const project = (position: Position) => {
    const [longitude, latitude] = position;
    const x = ((longitude + 180) / 360) * worldSize;
    const sin = Math.sin((latitude * Math.PI) / 180);
    const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * worldSize;
    return { x, y };
  };
  const origin = project(center);
  return (position: Position) => {
    const point = project(position);
    return { x: point.x - origin.x + 720, y: point.y - origin.y + 360 };
  };
}

const westland = getContent("nl").pointsOfInterest.find((point) => point.id === "westland");

function westlandRing(): Position[] {
  if (westland?.precision !== "boundary") throw new Error("westland is geen boundary-POI");
  return westland.ring;
}

const SIZE = { width: 1440, height: 721 };

describe("grenscontour als vectorlijn", () => {
  it("projecteert de ring naar schermpunten en houdt hem gesloten", () => {
    const points = projectRing(westlandRing(), mercator(11));

    expect(points.length).toBe(westlandRing().length);
    expect(ringIsClosed(points)).toBe(true);
    expect(ringIsOnScreen(points, SIZE)).toBe(true);
  });

  it("meet de gemeente op focusZoom 11 op ongeveer 540 px breed", () => {
    const points = projectRing(westlandRing(), mercator(11));
    const xs = points.map((point) => point.x);
    const width = Math.max(...xs) - Math.min(...xs);

    // 12,6 km bij ~23,5 m/px: de officiële grens volgt de kust, dus smaller dan de OSM-variant
    // die ~1 km de zee in stak (die was 588 px).
    expect(width).toBeGreaterThan(500);
    expect(width).toBeLessThan(580);
  });

  it("levert niets op als de kijkhoek buiten de kaart valt", () => {
    const points: ScreenPoint[] = projectRing(westlandRing(), () => ({ x: Number.NaN, y: 0 }));

    expect(points).toEqual([]);
    expect(ringIsOnScreen(points, SIZE)).toBe(false);
  });

  it("beschouwt een ver uitgezoomde ring nog steeds als zichtbaar", () => {
    const points = projectRing(westlandRing(), mercator(MIN_OUTLINE_ZOOM));

    expect(ringIsOnScreen(points, SIZE)).toBe(true);
  });

  it("valt buiten beeld op maxZoom, want dan kijk je ín de gemeente", () => {
    const points = projectRing(westlandRing(), mercator(14));

    // Geen enkel punt van de ring staat dan nog op de kaart, dus de lijn voegt niets toe.
    expect(
      points.every(
        (point) => point.x < 0 || point.x > SIZE.width || point.y < 0 || point.y > SIZE.height,
      ),
    ).toBe(true);
  });

  it("herkent een open lijn als niet-gesloten", () => {
    const open: ScreenPoint[] = [
      { x: 10, y: 10 },
      { x: 100, y: 10 },
      { x: 100, y: 100 },
      { x: 10, y: 90 },
    ];

    expect(ringIsClosed(open)).toBe(false);
    expect(ringIsClosed([])).toBe(false);
  });
});
