import type { ProjectId } from "@/data/projects";
import { westlandBoundaryRing } from "@/data/westland-boundary";

export type Position = [longitude: number, latitude: number];

export type PointOfInterestId = "techniek-college-schiedam" | "urbexium-germany" | "westland";

type PointOfInterestBaseFields = {
  id: PointOfInterestId;
  focusZoom: number;
  maxZoom: number;
  projectId?: ProjectId;
};

export type ExactPointOfInterestBase = PointOfInterestBaseFields & {
  precision: "exact";
  position: Position;
  address: string;
};

export type ApproximatePointOfInterestBase = PointOfInterestBaseFields & {
  precision: "approximate";
  center: Position;
  radiusKm: number;
};

/**
 * An area instead of a point: the ring is drawn as an outline, so there is no radius to
 * approximate with a circle and no single coordinate to store. Everything positional —
 * the camera, the OpenStreetMap link — derives from the ring itself.
 */
export type BoundaryPointOfInterestBase = PointOfInterestBaseFields & {
  precision: "boundary";
  ring: Position[];
};

export type PointOfInterestBase =
  | ExactPointOfInterestBase
  | ApproximatePointOfInterestBase
  | BoundaryPointOfInterestBase;

export type PointOfInterestText = {
  label: string;
  location: string;
  relation: string;
};

export type PointOfInterest = PointOfInterestBase & PointOfInterestText;

export const pointOfInterestBase: PointOfInterestBase[] = [
  {
    id: "techniek-college-schiedam",
    precision: "exact",
    position: [4.3832053, 51.9239476],
    address: "Schiedamseweg 245, 3118 JB Schiedam",
    focusZoom: 16.5,
    maxZoom: 19,
  },
  {
    id: "urbexium-germany",
    precision: "approximate",
    center: [6.7735, 51.2277],
    radiusKm: 25,
    focusZoom: 7.5,
    maxZoom: 9,
    projectId: "urbexium",
  },
  {
    id: "westland",
    precision: "boundary",
    ring: westlandBoundaryRing,
    focusZoom: 11,
    maxZoom: 14,
  },
];
