import type { ReactNode } from "react";

type SectionTone = "paper" | "chalk" | "forest";

type SectionProps = {
  id: string;
  title: string;
  lead?: string;
  tone?: SectionTone;
  children: ReactNode;
};

const toneStyles: Record<SectionTone, string> = {
  paper: "border-t border-rule",
  chalk: "tone-chalk border-t border-rule",
  forest: "tone-forest border-t border-rule",
};

export function Section({ id, title, lead, tone = "paper", children }: SectionProps) {
  const headingId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={headingId} className={toneStyles[tone]}>
      <div className="shell py-[4.5rem] md:py-28 lg:py-36">
        <div className="grid grid-cols-1 gap-y-4 md:grid-cols-12 md:items-start md:gap-x-8">
          <h2 id={headingId} className="font-display text-section md:col-span-6 lg:col-span-7">
            {title}
          </h2>
          {lead ? (
            <p className="max-w-[46ch] text-lead text-soft md:col-span-6 lg:col-span-5">{lead}</p>
          ) : null}
        </div>
        <div className="mt-12 md:mt-16">{children}</div>
      </div>
    </section>
  );
}
