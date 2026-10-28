import { ProjectPlate } from "@/components/project-plate";
import { Section } from "@/components/section";
import { type Project, projects } from "@/data/projects";

function ProjectRow({ project }: { project: Project }) {
  return (
    <li id={`project-${project.id}`} className="group relative border-b border-rule">
      <div className="grid grid-cols-1 gap-y-6 py-10 md:grid-cols-12 md:gap-x-8 md:py-14">
        <div className="md:col-span-8 md:col-start-5 lg:col-span-5 lg:col-start-5">
          <h3 className="font-display text-project transition-colors duration-200 ease-settle group-hover:text-forest group-focus-within:text-forest motion-reduce:transition-none">
            {project.title}
          </h3>
          <p className="mt-4 max-w-[46ch] text-lead text-soft">{project.tagline}</p>
          <p className="mt-4 max-w-[54ch] text-note text-soft">{project.summary}</p>
        </div>
        <div className="md:col-span-4 md:col-start-1 md:row-start-1">
          <ProjectPlate project={project} />
        </div>
        <div className="md:col-span-8 md:col-start-5 md:row-start-2 lg:col-span-3 lg:col-start-10 lg:row-start-1">
          <dl>
            <dt className="text-label text-soft">Stack</dt>
            <dd className="mt-1 text-note text-ink">{project.stack.join(", ")}</dd>
          </dl>
          {project.href && project.linkLabel ? (
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center text-note text-soft underline decoration-rule underline-offset-4 transition-[color,text-decoration-color] duration-200 ease-settle hover:text-forest hover:decoration-forest group-hover:decoration-forest group-focus-within:decoration-forest motion-reduce:transition-none"
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
      lead="Vier projecten, van een platform voor verlaten plekken tot een benchmark voor satellietbeelden."
    >
      <ul className="border-t border-rule">
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
      </ul>
    </Section>
  );
}
