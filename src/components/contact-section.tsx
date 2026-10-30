import { Section } from "@/components/section";
import type { SiteContent } from "@/content/types";

export function ContactSection({ content }: { content: SiteContent }) {
  const section = content.sections.contact;
  const socialLinks = content.profileLinks.filter((link) => !link.href.startsWith("mailto:"));

  return (
    <Section id={section.id} title={section.title} lead={section.lead} tone="forest">
      <a
        href={`mailto:${content.profile.email}`}
        className="inline-block max-w-full break-words font-display text-[clamp(1.75rem,8.5vw,4.5rem)] leading-[1.05] tracking-[-0.02em] text-paper decoration-paper/40 decoration-[2px] underline-offset-[0.12em] transition-[text-decoration-color] duration-200 ease-settle hover:decoration-paper motion-reduce:transition-none"
      >
        {content.profile.email}
      </a>
      <ul className="mt-12 flex flex-wrap gap-x-12 gap-y-6 border-t border-rule pt-8 md:mt-16">
        {socialLinks.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${link.label}, ${link.handle} ${content.ui.opensInNewTab}`}
              className="group inline-flex min-h-11 flex-col justify-center text-note text-soft transition-[color] duration-200 ease-settle hover:text-paper motion-reduce:transition-none"
            >
              <span className="font-medium text-paper">{link.label}</span>
              <span className="mt-0.5 text-label underline decoration-rule underline-offset-4 transition-[text-decoration-color] duration-200 ease-settle group-hover:decoration-paper motion-reduce:transition-none">
                {link.handle}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
