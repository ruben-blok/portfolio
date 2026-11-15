"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import type { SiteContent } from "@/content/types";
import { LOCALE_STORAGE_KEY, localeHref } from "@/lib/locale";

const SOURCE_URL = "https://github.com/ruben-blok/portfolio";

const columnTitleClass =
  "mb-4 font-display text-[1.3rem] font-normal leading-none tracking-[0.01em] text-paper";
const footerLinkClass =
  "text-[0.8rem] text-paper/80 transition-colors hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper";

type SiteFooterProps = {
  content: SiteContent;
  year: number;
};

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <h3 className={columnTitleClass}>{title}</h3>
      <ul className="m-0 list-none space-y-1 p-0">{children}</ul>
    </div>
  );
}

export function SiteFooter({ content, year }: SiteFooterProps) {
  const footerRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const { profile, footer, ui, languageSwitch, navigation, projects, profileLinks, education } =
    content;
  const emailHref = `mailto:${profile.email}?subject=${encodeURIComponent(footer.emailSubject)}`;
  const linkedProjects = projects.filter((project) => project.href);
  const educationEntry = education[0];

  useEffect(() => {
    const node = footerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    let observer: IntersectionObserver | undefined;
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        setRevealed(entry.isIntersecting);
      },
      { rootMargin: "0px", threshold: 0 },
    );
    observer.observe(node);

    return () => observer?.disconnect();
  }, []);

  const rememberLocale = () => {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, languageSwitch.locale);
    } catch {
      // Storage can be unavailable, for example in private browsing modes.
    }
  };

  return (
    <footer
      id="contact"
      ref={footerRef}
      data-revealed={revealed ? "true" : "false"}
      className="site-footer"
    >
      <noscript>
        <style>{`
          .site-footer-reveal { opacity: 1; filter: none; transform: none; }
        `}</style>
      </noscript>

      <div className="site-footer-panel">
        <div className="site-footer-noise" aria-hidden="true" />
        <div className="site-footer-reveal relative z-10 flex w-full flex-col pt-8 md:pt-72">
          <div className="shell mb-16">
            <p className="mb-3 font-display text-[1.125rem] font-normal uppercase tracking-[-0.01em] text-paper">
              {profile.name}
            </p>
            <a
              href={emailHref}
              className="inline-block max-w-full break-words font-display text-[clamp(1.75rem,8.5vw,4.5rem)] leading-[1.05] tracking-[-0.02em] text-paper underline decoration-paper/40 decoration-[2px] underline-offset-[0.12em] transition-[text-decoration-color] duration-200 ease-settle hover:decoration-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper motion-reduce:transition-none"
            >
              {profile.email}
            </a>
          </div>

          <div className="site-footer-line" aria-hidden="true" />

          <div className="shell flex flex-1 flex-col">
            <div className="mt-auto grid grid-cols-2 gap-8 pt-8 pb-12 md:grid-cols-3 lg:grid-cols-5">
              <FooterColumn title={footer.pagesLabel}>
                {navigation.map((item) => (
                  <li key={item.href}>
                    <a className={footerLinkClass} href={item.href}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </FooterColumn>

              <FooterColumn title={footer.projectsLabel}>
                {linkedProjects.map((project) => (
                  <li key={project.id}>
                    <a
                      className={footerLinkClass}
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {project.title}
                      <span className="sr-only"> {ui.opensInNewTab}</span>
                    </a>
                  </li>
                ))}
              </FooterColumn>

              <div className="flex flex-col">
                <h3 className={columnTitleClass}>{footer.locationLabel}</h3>
                <div className="space-y-1 text-[0.8rem] text-paper/80">
                  <p>
                    {profile.location}, {footer.country}
                  </p>
                  {educationEntry?.school ? <p>{educationEntry.school}</p> : null}
                  {educationEntry ? (
                    <>
                      <p>{educationEntry.programme}</p>
                      <p className="text-paper/70">{educationEntry.period}</p>
                    </>
                  ) : null}
                </div>
              </div>

              <FooterColumn title={footer.siteLabel}>
                <li>
                  <a
                    className={footerLinkClass}
                    href={localeHref(languageSwitch.locale)}
                    hrefLang={languageSwitch.locale}
                    lang={languageSwitch.locale}
                    aria-label={languageSwitch.ariaLabel}
                    onClick={rememberLocale}
                  >
                    {languageSwitch.label}
                  </a>
                </li>
                <li>
                  <a
                    className={footerLinkClass}
                    href={SOURCE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {footer.source}
                    <span className="sr-only"> {ui.opensInNewTab}</span>
                  </a>
                </li>
                <li>
                  <a className={footerLinkClass} href="#top">
                    {ui.backToTop}
                  </a>
                </li>
              </FooterColumn>

              <FooterColumn title={footer.connectLabel}>
                {profileLinks.map((link) => {
                  const external = !link.href.startsWith("mailto:");

                  return (
                    <li key={link.id}>
                      <a
                        className={footerLinkClass}
                        href={link.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                      >
                        {link.label}
                        {external ? <span className="sr-only"> {ui.opensInNewTab}</span> : null}
                      </a>
                    </li>
                  );
                })}
              </FooterColumn>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-[0.8rem] text-paper/70 md:pb-8">
              <p>
                © {year} {profile.name}, {profile.location}
              </p>
              <p>{footer.builtWith}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
