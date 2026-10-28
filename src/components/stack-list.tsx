import { Section } from "@/components/section";
import { stackGroups } from "@/data/stack";

export function StackList() {
  return (
    <Section
      id="stack"
      title="Stack"
      lead="Waar ik mee werk, van taal tot het gereedschap eromheen."
      tone="chalk"
    >
      <dl className="border-t border-rule">
        {stackGroups.map((group) => (
          <div
            key={group.id}
            className="grid grid-cols-1 gap-y-2 border-b border-rule py-6 md:grid-cols-12 md:items-baseline md:gap-x-8 md:py-7"
          >
            <dt className="font-display text-[1.375rem] leading-tight text-forest italic md:col-span-4 lg:col-span-3">
              {group.label}
            </dt>
            <dd className="text-[1.125rem] leading-[1.65] text-ink md:col-span-8 md:col-start-5 lg:col-span-9 lg:col-start-4">
              {group.items.join(", ")}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
