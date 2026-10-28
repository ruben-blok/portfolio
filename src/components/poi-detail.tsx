import type { PointOfInterest } from "@/data/points-of-interest";

type PoiDetailProps = {
  point: PointOfInterest;
};

export function PoiDetail({ point }: PoiDetailProps) {
  return (
    <div className="poi-detail">
      <div className="poi-detail-heading">
        <h2 className="font-display">{point.label}</h2>
        <p className="text-note text-soft">{point.relation}</p>
      </div>
      {point.precision === "exact" ? <p className="sr-only">{point.address}</p> : null}
    </div>
  );
}
