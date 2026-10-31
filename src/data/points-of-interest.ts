import type { ProjectId } from "@/data/projects";

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

export type PointOfInterestBase = ExactPointOfInterestBase | ApproximatePointOfInterestBase;

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
    precision: "approximate",
    center: [4.2019089, 52.0014044],
    radiusKm: 7,
    focusZoom: 11,
    maxZoom: 14,
  },
];
