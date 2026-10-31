import type { Position } from "@/data/points-of-interest";

/**
 * Turns the boundary ring into character cells for the ASCII canvas.
 *
 * The map itself cannot show an area outline: the ASCII pass reads a downscaled frame where
 * a stroke of a few pixels averages into the tone of the roads, so a vector layer is drawn
 * and then lost in the conversion. Walking the ring in *cell space* instead puts the
 * outline on the same grid the glyphs live on, which makes it legible at any width and
 * independent of how thick the stroke behind it is.
 */

/** The character grid the ASCII pass paints on, in backing-store pixels. */
export type ContourGrid = {
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
};

export type ContourCell = {
  column: number;
  row: number;
};

/** Projects a `[longitude, latitude]` pair to container pixels, like `map.project`. */
export type ContourProjector = (position: Position) => { x: number; y: number };

/** Below this zoom an area is a smudge of cells rather than a shape worth drawing. */
export const MIN_CONTOUR_ZOOM = 7;

const key = (cell: ContourCell) => `${cell.column}:${cell.row}`;

/**
 * Every cell the outline passes through. Consecutive vertices are sampled twice per cell so
 * neighbouring cells always touch — a contour with gaps would read as loose dots instead of
 * a boundary. Cells outside the grid are dropped, which is what keeps a zoomed-in area from
 * painting off-canvas.
 */
export function ringToCells(
  ring: Position[],
  project: ContourProjector,
  grid: ContourGrid,
): ContourCell[] {
  const cells = new Map<string, ContourCell>();

  const add = (x: number, y: number) => {
    const column = Math.floor(x / grid.cellWidth);
    const row = Math.floor(y / grid.cellHeight);
    if (column < 0 || row < 0 || column >= grid.columns || row >= grid.rows) return;
    const cell = { column, row };
    cells.set(key(cell), cell);
  };

  const projected = ring.map((position) => project(position));

  for (let index = 0; index < projected.length; index += 1) {
    const from = projected[index];
    const to = projected[(index + 1) % projected.length];
    if (!from || !to) continue;

    const spanX = Math.abs(to.x - from.x) / grid.cellWidth;
    const spanY = Math.abs(to.y - from.y) / grid.cellHeight;
    if (!Number.isFinite(spanX) || !Number.isFinite(spanY)) continue;

    const steps = Math.max(1, Math.ceil(Math.max(spanX, spanY) * 2));
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      add(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
    }
  }

  return [...cells.values()].sort((a, b) => a.row - b.row || a.column - b.column);
}

/**
 * Widens the contour by `rows` cells downwards. A single glyph per cell is already as dense
 * as the grid allows, so emphasis has to add cells rather than a bolder character; and at
 * street zoom the basemap is itself dense with `#` clusters, so even the resting contour is
 * drawn as a two-cell band to stay distinguishable from roads.
 */
export function thickenCells(cells: ContourCell[], grid: ContourGrid, rows = 1): ContourCell[] {
  const widened = new Map<string, ContourCell>();

  for (const cell of cells) {
    widened.set(key(cell), cell);
    for (let offset = 1; offset <= rows; offset += 1) {
      const below = { column: cell.column, row: cell.row + offset };
      if (below.row < grid.rows) widened.set(key(below), below);
    }
  }

  return [...widened.values()].sort((a, b) => a.row - b.row || a.column - b.column);
}

/**
 * Empty paper around the contour, `width` cells wide. The basemap at street zoom is itself
 * dense with `#` clusters (roads, buildings), so an outline drawn straight onto it competes
 * with that noise; clearing a channel first gives the line a casing and makes the shape read.
 */
export function haloCells(cells: ContourCell[], grid: ContourGrid, width = 1): ContourCell[] {
  const contour = new Set(cells.map(key));
  const halo = new Map<string, ContourCell>();

  for (const cell of cells) {
    for (let dy = -width; dy <= width; dy += 1) {
      for (let dx = -width; dx <= width; dx += 1) {
        const column = cell.column + dx;
        const row = cell.row + dy;
        if (column < 0 || row < 0 || column >= grid.columns || row >= grid.rows) continue;
        const candidate = { column, row };
        if (contour.has(key(candidate))) continue;
        halo.set(key(candidate), candidate);
      }
    }
  }

  return [...halo.values()];
}

/**
 * True when the cells form one connected chain with no isolated glyph: every cell has a
 * neighbour within one cell in any direction. This is the property that makes the outline
 * read as a boundary instead of as noise.
 */
export function isConnected(cells: ContourCell[]): boolean {
  if (cells.length < 3) return false;
  const occupied = new Set(cells.map(key));

  return cells.every((cell) => {
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) continue;
        if (occupied.has(`${cell.column + dx}:${cell.row + dy}`)) return true;
      }
    }
    return false;
  });
}
