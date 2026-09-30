import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  title: string;
  lead?: string;
  children: ReactNode;
};

export function Section({ id, title, lead, children }: SectionProps) {
  const headingId = `${id}-titel`;

  return (
    <section id={id} aria-labelledby={headingId} className="border-t border-rule">
      <div className="shell py-[4.5rem] md:py-28 lg:py-36">
        <h2 id={headingId} className="font-display text-section">
          {title}
        </h2>
        {lead ? <p className="prose-column mt-5 text-lead text-soft">{lead}</p> : null}
        <div className="mt-12 md:mt-16">{children}</div>
      </div>
    </section>
  );
}
