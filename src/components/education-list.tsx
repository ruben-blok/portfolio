import { Section } from "@/components/section";
import { education } from "@/data/education";

export function EducationList() {
  return (
    <Section id="opleiding" title="Opleiding">
      <ul className="border-t border-rule">
        {education.map((entry) => (
          <li
            key={entry.id}
            className="grid grid-cols-1 gap-y-2 border-b border-rule py-7 md:grid-cols-12 md:gap-x-8"
          >
            <div className="md:col-span-7">
              <p className="font-display text-title">{entry.programme}</p>
              {entry.school ? <p className="mt-1 text-note text-soft">{entry.school}</p> : null}
            </div>
            <p className="text-note text-soft md:col-span-4 md:col-start-9">{entry.period}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
