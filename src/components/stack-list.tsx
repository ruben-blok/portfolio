import { Section } from "@/components/section";
import { stackGroups } from "@/data/stack";

export function StackList() {
  return (
    <Section
      id="stack"
      title="Stack"
      lead="Waar ik mee werk, van taal tot het gereedschap eromheen."
    >
      <dl className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {stackGroups.map((group) => (
          <div key={group.id} className="border-t border-rule pt-5">
            <dt className="font-display text-note text-soft italic">{group.label}</dt>
            <dd className="mt-3 text-note">{group.items.join(", ")}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
