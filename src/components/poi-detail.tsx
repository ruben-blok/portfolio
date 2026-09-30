import type { PointOfInterest } from "@/data/points-of-interest";
import type { Project } from "@/data/projects";

type PoiDetailProps = {
  point: PointOfInterest;
  project?: Project;
};

export function PoiDetail({ point, project }: PoiDetailProps) {
  return (
    <div className="poi-detail" aria-live="polite">
      <p className="font-display text-label text-forest italic">{point.location}</p>
      <h2 className="mt-2 font-display text-title">{point.label}</h2>
      <p className="mt-1 text-note text-soft">{point.relation}</p>
      {point.precision === "exact" ? (
        <p className="mt-3 max-w-[48ch] text-note text-soft">{point.address}</p>
      ) : null}
      {project ? (
        <>
          <p className="mt-5 max-w-[48ch] text-copy text-soft">{project.summary}</p>
          <p className="mt-4 text-note text-soft">{project.stack.join(", ")}</p>
          {project.href && project.linkLabel ? (
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center font-medium text-forest underline decoration-rule underline-offset-[6px] transition-[color,text-decoration-color] duration-200 ease-settle hover:text-forest-deep hover:decoration-forest motion-reduce:transition-none"
            >
              {project.linkLabel}
              <span className="sr-only"> (opent in een nieuw tabblad)</span>
            </a>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
