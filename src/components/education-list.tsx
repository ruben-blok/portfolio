import { Section } from "@/components/section";
import { education } from "@/data/education";

export function EducationList() {
  return (
    <Section id="opleiding" title="Opleiding" lead="Van havo naar software development.">
      <ul className="border-t border-rule">
        {education.map((entry) => (
          <li
            key={entry.id}
            className="grid grid-cols-1 gap-y-2 border-b border-rule py-8 md:grid-cols-12 md:items-baseline md:gap-x-8 md:py-10"
          >
            <p
              className={`font-display text-[clamp(1.5rem,2.4vw,2rem)] leading-none md:col-span-3 ${
                entry.current ? "text-forest" : "text-soft"
              }`}
            >
              {entry.period}
            </p>
            <div className="md:col-span-9">
              <h3 className="font-display text-title">{entry.programme}</h3>
              {entry.school ? <p className="mt-1 text-note text-soft">{entry.school}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
