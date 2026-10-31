import { describe, expect, it } from "vitest";
import { getContent } from "@/content";
import type { Position } from "@/data/points-of-interest";
import {
  type ContourCell,
  type ContourGrid,
  haloCells,
  isConnected,
  MIN_CONTOUR_ZOOM,
  ringToCells,
  thickenCells,
} from "@/lib/boundary-contour";

/** Same grid the map uses at a 1440x721 canvas: 6 px wide, 12 px tall cells. */
const GRID: ContourGrid = { columns: 240, rows: 60, cellWidth: 6, cellHeight: 12 };

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

const SQUARE: Position[] = [
  [4.1, 51.9],
  [4.3, 51.9],
  [4.3, 52.1],
  [4.1, 52.1],
  [4.1, 51.9],
];

describe("grenscontour als glyph-cellen", () => {
  it("levert een gesloten, aaneengesloten contour op zoom 11", () => {
    const cells = ringToCells(westlandRing(), mercator(11), GRID);

    expect(cells.length).toBeGreaterThan(150);
    expect(cells.length).toBeLessThan(900);
    // Geen losse stippen: elke cel raakt een buurcel.
    expect(isConnected(cells)).toBe(true);
  });

  it("bezet alle vier de randen van zijn eigen kader, dus de vorm is rond", () => {
    const cells = ringToCells(westlandRing(), mercator(11), GRID);
    const columns = cells.map((cell) => cell.column);
    const rows = cells.map((cell) => cell.row);
    const minColumn = Math.min(...columns);
    const maxColumn = Math.max(...columns);
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);

    // Op elke uiterste rij en kolom moet minstens één cel liggen.
    expect(columns).toContain(minColumn);
    expect(columns).toContain(maxColumn);
    expect(rows).toContain(minRow);
    expect(rows).toContain(maxRow);
    expect(maxColumn - minColumn).toBeGreaterThan(20);
    expect(maxRow - minRow).toBeGreaterThan(10);
  });

  it("vult het beeld op focusZoom 11 en valt op maxZoom buiten het canvas", () => {
    const atEleven = ringToCells(westlandRing(), mercator(11), GRID).length;
    const atFourteen = ringToCells(westlandRing(), mercator(14), GRID);

    expect(atEleven).toBeGreaterThan(150);
    // Op zoom 14 staat de rand buiten het canvas — je kijkt dan ín de gemeente — dus levert
    // de wandeling geen cellen en verminkt de contour de kaart niet.
    expect(atFourteen.length).toBe(0);
  });

  it("laat cellen buiten het canvas vallen in plaats van negatief tekenen", () => {
    const offScreen = () => ({ x: -5000, y: -5000 });
    expect(ringToCells(SQUARE, offScreen, GRID)).toEqual([]);
  });

  it("geeft een vierkante ring vier rechte zijden", () => {
    const cells = ringToCells(SQUARE, mercator(11), GRID);
    const columns = cells.map((cell) => cell.column);
    const rows = cells.map((cell) => cell.row);

    expect(isConnected(cells)).toBe(true);
    expect(Math.max(...columns) - Math.min(...columns)).toBeGreaterThan(20);
    expect(Math.max(...rows) - Math.min(...rows)).toBeGreaterThan(8);
  });

  it("verdicht de contour met een extra rij cellen bij hover of focus", () => {
    const cells = ringToCells(westlandRing(), mercator(11), GRID);
    const dense = thickenCells(cells, GRID);

    expect(dense.length).toBeGreaterThan(cells.length);
    expect(isConnected(dense)).toBe(true);
    // Niets voorbij de onderrand van het raster.
    expect(Math.max(...dense.map((cell) => cell.row))).toBeLessThan(GRID.rows);
  });

  it("snijdt één cel papier vrij rond de contour als casing", () => {
    const cells = ringToCells(westlandRing(), mercator(11), GRID);
    const halo = haloCells(cells, GRID);
    const contour = new Set(cells.map((cell) => `${cell.column}:${cell.row}`));

    expect(halo.length).toBeGreaterThan(0);
    // De halo ligt naast de contour, niet erop.
    expect(halo.every((cell) => !contour.has(`${cell.column}:${cell.row}`))).toBe(true);
    // En blijft binnen het raster.
    expect(halo.every((cell) => cell.column >= 0 && cell.column < GRID.columns)).toBe(true);
    expect(halo.every((cell) => cell.row >= 0 && cell.row < GRID.rows)).toBe(true);
  });

  it("herkent losse stippen als niet-gesloten", () => {
    const dots: ContourCell[] = [
      { column: 1, row: 1 },
      { column: 9, row: 1 },
      { column: 1, row: 9 },
      { column: 9, row: 9 },
    ];

    expect(isConnected(dots)).toBe(false);
  });

  it("tekent niets onder de drempel voor ver uitgezoomde kaarten", () => {
    expect(MIN_CONTOUR_ZOOM).toBeGreaterThan(0);
    const cramped = ringToCells(westlandRing(), mercator(MIN_CONTOUR_ZOOM - 3), GRID);

    // Op dat niveau valt de ring samen tot een paar cellen; de kaart slaat hem dan over.
    expect(cramped.length).toBeLessThan(60);
  });
});
