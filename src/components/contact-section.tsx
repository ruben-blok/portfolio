import { Section } from "@/components/section";
import { profile, profileLinks } from "@/data/profile";

export function ContactSection() {
  const socialLinks = profileLinks.filter((link) => !link.href.startsWith("mailto:"));

  return (
    <Section
      id="contact"
      title="Contact"
      lead="Voor een stage, een samenwerking of een vraag over een van mijn projecten."
    >
      <a
        href={`mailto:${profile.email}`}
        className="inline-block font-display text-section text-forest decoration-forest/25 decoration-[2px] underline-offset-[0.12em] transition-[text-decoration-color] duration-200 ease-settle hover:decoration-forest motion-reduce:transition-none"
      >
        {profile.email}
      </a>
      <ul className="mt-12 flex flex-wrap gap-x-10 gap-y-1">
        {socialLinks.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center text-note text-soft underline decoration-rule underline-offset-4 transition-[color,text-decoration-color] duration-200 ease-settle hover:text-forest hover:decoration-forest motion-reduce:transition-none"
            >
              {link.label} <span className="sr-only">(opent in een nieuw tabblad)</span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
