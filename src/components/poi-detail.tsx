import type { PointOfInterest } from "@/data/points-of-interest";
import type { Project } from "@/data/projects";

type PoiDetailProps = {
  point: PointOfInterest;
  project?: Project;
};

export function PoiDetail({ point, project }: PoiDetailProps) {
  return (
    <div className="poi-detail" aria-live="polite">
      <h2 className="font-display text-lead">{point.label}</h2>
      <p className="mt-1 text-note text-soft">{point.relation}</p>
      {point.precision === "exact" ? (
        <p className="mt-2 max-w-[48ch] text-note text-soft">{point.address}</p>
      ) : null}
      {project ? (
        <a
          href={`#project-${project.id}`}
          className="mt-4 inline-flex min-h-11 items-center bg-forest px-5 py-2.5 text-note font-semibold text-paper transition-[background-color,translate] duration-200 ease-settle hover:-translate-y-0.5 hover:bg-forest-deep motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          Naar project
          <span className="sr-only"> over {project.title}</span>
        </a>
      ) : null}
    </div>
  );
}
