import type { MapGeoJSONFeature } from "maplibre-gl";
import { MONOSPACE_STACK } from "@/lib/ascii-map";

/**
 * The basemap style bakes its text into the rasterised symbol layers. Converting the
 * canvas to ASCII destroys those glyphs, so the label text is read back from the
 * vector data and painted as real DOM text on top of the ASCII art instead.
 */

export type MapLabel = {
  id: string;
  text: string;
  x: number;
  y: number;
  rank: number;
};

type LabelRule = {
  /** Style layer the names are read from. */
  layer: string;
  /** Field used for the label text. */
  field: string;
  /** Higher rank wins when two labels collide. */
  rank: number;
  /** Zoom at which the label starts appearing. */
  minZoom: number;
};

/**
 * Ordered from most to least important. Later rules never replace an already placed
 * label with the same text, so a country name survives zooming past a city name.
 */
export const LABEL_RULES: LabelRule[] = [
  { layer: "label_country_1", field: "name", rank: 6, minZoom: 0 },
  { layer: "label_country_2", field: "name", rank: 5, minZoom: 0 },
  { layer: "label_country_3", field: "name", rank: 4, minZoom: 0 },
  { layer: "label_city_capital", field: "name", rank: 3, minZoom: 0 },
  { layer: "label_city", field: "name", rank: 3, minZoom: 0 },
  { layer: "label_town", field: "name", rank: 2, minZoom: 6 },
  { layer: "label_village", field: "name", rank: 2, minZoom: 9 },
  { layer: "label_other", field: "name", rank: 1, minZoom: 8 },
  { layer: "water_name_point_label", field: "name", rank: 0, minZoom: 0 },
  { layer: "highway-name-major", field: "name", rank: 4, minZoom: 12 },
  { layer: "highway-name-minor", field: "name", rank: 3, minZoom: 15 },
  { layer: "highway-name-path", field: "name", rank: 2, minZoom: 16.5 },
];

const LABELLED_LAYERS = LABEL_RULES.map((rule) => rule.layer);

export type LabelFeature = Pick<MapGeoJSONFeature, "layer" | "geometry"> & {
  properties: Record<string, unknown>;
};

function featurePoints(geometry: LabelFeature["geometry"]): [number, number][] {
  if (geometry.type === "Point") return [geometry.coordinates as [number, number]];
  if (geometry.type === "MultiPoint") return geometry.coordinates as [number, number][];
  if (geometry.type === "LineString") {
    const coordinates = geometry.coordinates as [number, number][];
    const middle = coordinates[Math.floor(coordinates.length / 2)];
    return middle ? [middle] : [];
  }
  if (geometry.type === "MultiLineString") {
    const points = (geometry.coordinates as [number, number][][]).flat();
    const middle = points[Math.floor(points.length / 2)];
    return middle ? [middle] : [];
  }
  if (geometry.type === "Polygon") {
    const ring = (geometry.coordinates as [number, number][][])[0];
    if (!ring?.length) return [];
    return [ring[Math.floor(ring.length / 2)]];
  }
  if (geometry.type === "MultiPolygon") {
    const ring = (geometry.coordinates as [number, number][][][])[0]?.[0];
    if (!ring?.length) return [];
    return [ring[Math.floor(ring.length / 2)]];
  }
  return [];
}

export function labelText(feature: LabelFeature, field: string) {
  const value = feature.properties?.[field];
  if (typeof value !== "string") return "";
  return value.trim();
}

export type LabelMetrics = {
  /** Width of a single character in CSS pixels. */
  charWidth: number;
  /** Full line height in CSS pixels. */
  lineHeight: number;
};

export const DEFAULT_LABEL_METRICS: LabelMetrics = { charWidth: 5, lineHeight: 11 };

/** Measures rendered label geometry in CSS pixels from a real 2D context. */
export function labelMetrics(context: CanvasRenderingContext2D): LabelMetrics {
  context.save();
  context.font = `16px ${MONOSPACE_STACK}`;
  const charWidth = context.measureText("M").width / 16;
  context.restore();
  return { charWidth: charWidth || DEFAULT_LABEL_METRICS.charWidth, lineHeight: charWidth * 2.1 };
}

/** Width of `text` in CSS pixels, scaled from the 16px reference measurement. */
export function measureText(context: CanvasRenderingContext2D, text: string) {
  context.save();
  context.font = `16px ${MONOSPACE_STACK}`;
  const width = context.measureText(text).width;
  context.restore();
  return width;
}

/**
 * Turns raw query results into positioned labels. The project method converts a
 * geographic point into container pixels; points that fall outside the viewport are
 * skipped. `measure` reports the rendered width of a string so overlapping names are
 * dropped instead of piling up, and the count is capped so a dense street-level view
 * cannot swallow the map.
 */
export function toLabels(
  features: LabelFeature[],
  project: (position: [number, number]) => { x: number; y: number },
  options: {
    zoom: number;
    maxLabels: number;
    width: number;
    height: number;
    metrics?: LabelMetrics;
    measure?: (text: string) => number;
  },
): MapLabel[] {
  const { zoom, maxLabels, width, height, metrics = DEFAULT_LABEL_METRICS } = options;
  const rulesByLayer = new Map(LABEL_RULES.map((rule) => [rule.layer, rule]));
  const candidates: { label: MapLabel; minZoom: number }[] = [];

  for (const feature of features) {
    const rule = rulesByLayer.get(feature.layer?.id ?? "");
    if (!rule || zoom < rule.minZoom) continue;

    const text = labelText(feature, rule.field);
    if (!text) continue;

    for (const point of featurePoints(feature.geometry)) {
      const projected = project(point);
      if (
        !Number.isFinite(projected.x) ||
        !Number.isFinite(projected.y) ||
        projected.x < 0 ||
        projected.y < 0 ||
        projected.x > width ||
        projected.y > height
      ) {
        continue;
      }

      candidates.push({
        minZoom: rule.minZoom,
        label: {
          id: `${rule.layer}:${text}:${Math.round(projected.x)}:${Math.round(projected.y)}`,
          text,
          x: projected.x,
          y: projected.y,
          rank: rule.rank,
        },
      });
    }
  }

  candidates.sort(
    (a, b) => b.label.rank - a.label.rank || a.minZoom - b.minZoom || a.label.y - b.label.y,
  );

  const accepted: MapLabel[] = [];
  const seenText = new Set<string>();
  const occupied: [number, number][][] = [];
  const measured = new Map<string, number>();

  for (const { label } of candidates) {
    if (accepted.length >= maxLabels) break;
    const key = label.text.toLowerCase();
    if (seenText.has(key)) continue;

    let textWidth = measured.get(label.text);
    if (textWidth === undefined) {
      textWidth = options.measure
        ? options.measure(label.text)
        : label.text.length * metrics.charWidth;
      measured.set(label.text, textWidth);
    }

    // Labels are centred on their anchor, so the box is grown on both sides.
    const box: [number, number][] = [
      [label.x - textWidth / 2 - 2, label.y - metrics.lineHeight / 2],
      [label.x + textWidth / 2 + 2, label.y + metrics.lineHeight / 2],
    ];
    if (occupied.some((other) => intersects(box, other))) continue;

    seenText.add(key);
    occupied.push(box);
    accepted.push(label);
  }

  return accepted;
}

function intersects(a: [number, number][], b: [number, number][]) {
  return !(a[1][0] < b[0][0] || a[0][0] > b[1][0] || a[1][1] < b[0][1] || a[0][1] > b[1][1]);
}

export { LABELLED_LAYERS };
