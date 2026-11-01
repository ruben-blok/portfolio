import type { Position } from "@/data/points-of-interest";

/**
 * Geometry for the boundary outline.
 *
 * The outline is drawn as a real stroked line on its own canvas above the ASCII map, not as
 * characters on the character grid: a glyph contour reads as a chain of blocks with gaps,
 * and a grens hoort een strakke rand te zijn. Everything here is pure so the drawing can be
 * tested without a browser.
 */

export type ScreenPoint = { x: number; y: number };

/** Projects a `[longitude, latitude]` pair to container pixels, like `map.project`. */
export type RingProjector = (position: Position) => { x: number; y: number };

/** Below this zoom an area is a speck; drawing the line there adds noise, not information. */
export const MIN_OUTLINE_ZOOM = 7;

/**
 * Projects the ring to screen points. Non-finite projections (a point behind the globe) are
 * dropped rather than turned into `NaN` path commands, which would make the whole stroke
 * disappear instead of just that edge.
 */
export function projectRing(ring: Position[], project: RingProjector): ScreenPoint[] {
  const points: ScreenPoint[] = [];

  for (const position of ring) {
    const projected = project(position);
    if (!Number.isFinite(projected.x) || !Number.isFinite(projected.y)) continue;
    points.push({ x: projected.x, y: projected.y });
  }

  return points;
}

/**
 * True when part of the ring can be seen. A zoomed-in view sits *inside* the municipality,
 * where every vertex is off-canvas and the outline has nothing to add to the map.
 */
export function ringIsOnScreen(
  points: ScreenPoint[],
  size: { width: number; height: number },
): boolean {
  if (points.length < 3) return false;

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
  }

  return maxX >= 0 && maxY >= 0 && minX <= size.width && minY <= size.height;
}

/**
 * True when the first and last vertex cover the same spot, which is what makes the stroke a
 * closed shape rather than an open line.
 */
export function ringIsClosed(points: ScreenPoint[], tolerance = 0.75): boolean {
  if (points.length < 4) return false;
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return false;

  return Math.abs(first.x - last.x) <= tolerance && Math.abs(first.y - last.y) <= tolerance;
}
