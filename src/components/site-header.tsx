import { LanguageSwitch } from "@/components/language-switch";
import type { SiteContent } from "@/content/types";

export function SiteHeader({ content }: { content: SiteContent }) {
  return (
    <header className="border-b border-rule bg-paper md:sticky md:top-0 md:z-20">
      <div className="shell flex flex-col gap-1 py-4 md:flex-row md:items-baseline md:justify-between md:gap-8 md:py-5">
        <a
          href="#top"
          className="font-display text-[1.375rem] tracking-[-0.012em] text-ink transition-[color] duration-200 ease-settle hover:text-forest motion-reduce:transition-none"
        >
          {content.profile.name}
        </a>
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 md:gap-x-8">
          <nav aria-label={content.ui.sectionsNavLabel}>
            <ul className="flex flex-wrap gap-x-5 md:gap-x-8">
              {content.navigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-flex min-h-11 items-center text-label text-soft transition-[color] duration-200 ease-settle hover:text-forest md:min-h-0 md:py-1 motion-reduce:transition-none"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav
            aria-label={content.ui.languageNavLabel}
            className="md:border-l md:border-rule md:pl-5"
          >
            <LanguageSwitch copy={content.languageSwitch} />
          </nav>
        </div>
      </div>
    </header>
  );
}
