import type {
  BoundaryPointOfInterestBase,
  PointOfInterest,
  Position,
} from "@/data/points-of-interest";

export const GENERAL_MAX_ZOOM = 19;

export type MapCamera = {
  center: Position;
  zoom: number;
  bearing: number;
  pitch: number;
};

export function worldCamera(compact: boolean): MapCamera {
  return {
    center: [7, 43],
    zoom: compact ? 0.85 : 1.35,
    bearing: 0,
    pitch: 0,
  };
}

export function ringCenter(ring: Position[]): Position {
  let minLon = Number.POSITIVE_INFINITY;
  let maxLon = Number.NEGATIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  for (const [longitude, latitude] of ring) {
    if (longitude < minLon) minLon = longitude;
    if (longitude > maxLon) maxLon = longitude;
    if (latitude < minLat) minLat = latitude;
    if (latitude > maxLat) maxLat = latitude;
  }

  return [(minLon + maxLon) / 2, (minLat + maxLat) / 2];
}

/**
 * The spot a point of interest is aimed at. An area has no coordinate of its own, so its
 * anchor is the middle of the ring's bounding box — derived here rather than stored, so
 * the ring stays the single source of truth for the shape.
 */
export function pointPosition(point: PointOfInterest): Position {
  if (point.precision === "exact") return point.position;
  if (point.precision === "boundary") return ringCenter(point.ring);
  return point.center;
}

export function pointCamera(point: PointOfInterest): MapCamera {
  return {
    center: pointPosition(point),
    zoom: point.focusZoom,
    bearing: 0,
    pitch: point.precision === "exact" ? 38 : 0,
  };
}

/**
 * Pixels the camera is aimed above an area's centre. The legend padding already lifts the
 * camera content by half its height, and without this the top of the outline lands on the
 * canvas edge — the shape then reads as cut off instead of closed.
 */
const BOUNDARY_NUDGE_PX = 20;

/**
 * Camera for an area: the ring's centre pushed a little north, so the whole outline sits
 * inside the visible part of the canvas with a margin on the top edge.
 */
export function boundaryCamera(point: BoundaryPointOfInterestBase): MapCamera {
  const [longitude, latitude] = ringCenter(point.ring);
  const metersPerPixel =
    (METERS_PER_PIXEL_AT_ZOOM_ZERO * Math.cos((latitude * Math.PI) / 180)) / 2 ** point.focusZoom;
  const nudgeDegrees = (BOUNDARY_NUDGE_PX * metersPerPixel) / 111_320;

  return {
    center: [longitude, latitude + nudgeDegrees],
    zoom: point.focusZoom,
    bearing: 0,
    pitch: 0,
  };
}

export function isValidPosition(position: Position) {
  const [longitude, latitude] = position;
  return longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;
}

/**
 * MapLibre's world is 512 pixels wide at zoom 0, so one pixel covers this many metres of the
 * equator there (equator circumference divided by that world size). The 256-pixel variant of
 * this number (`156543.03392`) would draw every ground circle at half its real size.
 */
const METERS_PER_PIXEL_AT_ZOOM_ZERO = 40075016.686 / 512;

/** Screen radius in CSS pixels of a ground circle of `radiusKm` at `latitude` and `zoom`. */
export function circleRadiusPixels(radiusKm: number, latitude: number, zoom: number) {
  const metersPerPixel =
    (METERS_PER_PIXEL_AT_ZOOM_ZERO * Math.cos((latitude * Math.PI) / 180)) / 2 ** zoom;
  return (radiusKm * 1000) / metersPerPixel;
}

export function openStreetMapUrl(point: PointOfInterest) {
  const [longitude, latitude] = pointPosition(point);
  // An area opens at the zoom that frames the whole municipality rather than a street.
  const zoom = point.precision === "exact" ? 18 : point.precision === "boundary" ? 11 : 8;
  const marker = point.precision === "exact" ? `?mlat=${latitude}&mlon=${longitude}` : "";
  return `https://www.openstreetmap.org/${marker}#map=${zoom}/${latitude}/${longitude}`;
}
