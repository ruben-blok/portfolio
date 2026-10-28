import type { PointOfInterest, Position } from "@/data/points-of-interest";

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

export function pointPosition(point: PointOfInterest): Position {
  return point.precision === "exact" ? point.position : point.center;
}

export function pointCamera(point: PointOfInterest): MapCamera {
  return {
    center: pointPosition(point),
    zoom: point.focusZoom,
    bearing: 0,
    pitch: point.precision === "exact" ? 38 : 0,
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
  const zoom = point.precision === "exact" ? 18 : 8;
  const marker = point.precision === "exact" ? `?mlat=${latitude}&mlon=${longitude}` : "";
  return `https://www.openstreetmap.org/${marker}#map=${zoom}/${latitude}/${longitude}`;
}
