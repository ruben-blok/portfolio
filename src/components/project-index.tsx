import { Section } from "@/components/section";
import { type Project, projects } from "@/data/projects";

function ProjectRow({ project }: { project: Project }) {
  const isLinked = Boolean(project.href);

  return (
    <li
      id={`project-${project.id}`}
      className={`relative border-b border-rule ${isLinked ? "group" : ""}`}
    >
      <div className="grid grid-cols-1 gap-y-4 py-8 md:grid-cols-12 md:gap-x-8 md:py-10">
        <div className="md:col-span-7">
          <h3 className="font-display text-title">{project.title}</h3>
          <p className="prose-column mt-3 text-note text-soft">{project.summary}</p>
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <p className="text-note text-soft transition-[color] duration-200 ease-settle group-hover:text-ink group-focus-within:text-ink motion-reduce:transition-none">
            {project.stack.join(", ")}
          </p>
          {project.href && project.linkLabel ? (
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-11 items-center text-note text-soft underline decoration-rule underline-offset-4 transition-[color,text-decoration-color] duration-200 ease-settle hover:text-forest hover:decoration-forest group-hover:decoration-forest group-focus-within:decoration-forest motion-reduce:transition-none"
            >
              {project.linkLabel} <span className="sr-only">(opent in een nieuw tabblad)</span>
            </a>
          ) : null}
        </div>
      </div>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-forest transition-[scale] duration-[380ms] ease-settle group-hover:scale-x-100 group-focus-within:scale-x-100 motion-reduce:transition-none"
      />
    </li>
  );
}

export function ProjectIndex() {
  return (
    <Section
      id="projecten"
      title="Projecten"
      lead="Vier projecten waarin ik werkte aan interactie, data en het vindbaar maken van informatie die anders lastig te vinden is."
    >
      <ul className="border-t border-rule">
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
      </ul>
    </Section>
  );
}
