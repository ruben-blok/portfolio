export type Position = [longitude: number, latitude: number];

type PointOfInterestBase = {
  id: string;
  label: string;
  location: string;
  relation: string;
  focusZoom: number;
  maxZoom: number;
  projectId?: string;
};

export type ExactPointOfInterest = PointOfInterestBase & {
  precision: "exact";
  position: Position;
  address: string;
};

export type ApproximatePointOfInterest = PointOfInterestBase & {
  precision: "approximate";
  center: Position;
  radiusKm: number;
};

export type PointOfInterest = ExactPointOfInterest | ApproximatePointOfInterest;

export const pointsOfInterest: PointOfInterest[] = [
  {
    id: "techniek-college-schiedam",
    label: "Techniek College Rotterdam",
    precision: "exact",
    position: [4.3832053, 51.9239476],
    address: "Schiedamseweg 245, 3118 JB Schiedam",
    location: "Schiedam",
    relation: "Software Development",
    focusZoom: 16.5,
    maxZoom: 19,
  },
  {
    id: "urbexium-germany",
    label: "Urbexium",
    precision: "approximate",
    center: [6.7735, 51.2277],
    radiusKm: 25,
    location: "Duitsland",
    relation: "Gehost op een VPS",
    focusZoom: 7.5,
    maxZoom: 9,
    projectId: "urbexium",
  },
];
