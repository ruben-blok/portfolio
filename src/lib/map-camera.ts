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
    zoom: compact ? 0.65 : 1.35,
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

export function circlePolygon(center: Position, radiusKm: number, steps = 64) {
  const [longitude, latitude] = center;
  const latitudeRadius = radiusKm / 110.574;
  const longitudeRadius = radiusKm / (111.32 * Math.cos((latitude * Math.PI) / 180));
  const coordinates: Position[] = [];

  for (let step = 0; step <= steps; step += 1) {
    const angle = (step / steps) * Math.PI * 2;
    coordinates.push([
      longitude + Math.cos(angle) * longitudeRadius,
      latitude + Math.sin(angle) * latitudeRadius,
    ]);
  }

  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "Polygon" as const,
      coordinates: [coordinates],
    },
  };
}

export function openStreetMapUrl(point: PointOfInterest) {
  const [longitude, latitude] = pointPosition(point);
  const zoom = point.precision === "exact" ? 18 : 8;
  const marker = point.precision === "exact" ? `?mlat=${latitude}&mlon=${longitude}` : "";
  return `https://www.openstreetmap.org/${marker}#map=${zoom}/${latitude}/${longitude}`;
}
