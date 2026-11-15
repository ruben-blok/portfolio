import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/site-footer";
import { getContent } from "@/content";
import { localeHref } from "@/lib/locale";

const content = getContent("nl");

describe("site footer", () => {
  it("toont het e-mailadres als contact", () => {
    render(<SiteFooter content={content} year={2026} />);

    expect(screen.getByRole("link", { name: content.profile.email })).toHaveAttribute(
      "href",
      `mailto:${content.profile.email}?subject=${encodeURIComponent(content.footer.emailSubject)}`,
    );
  });

  it("toont de footer-kolommen en contactkanalen", () => {
    render(<SiteFooter content={content} year={2026} />);

    for (const item of content.navigation) {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute("href", item.href);
    }

    for (const project of content.projects) {
      if (!project.href) continue;

      expect(
        screen.getByRole("link", { name: new RegExp(project.title) }),
        project.id,
      ).toHaveAttribute("href", project.href);
    }

    const anchors = screen.getAllByRole("link");

    for (const link of content.profileLinks) {
      const matches = anchors.filter((anchor) => anchor.getAttribute("href") === link.href);

      expect(matches.length, link.label).toBeGreaterThan(0);

      for (const anchor of matches) {
        if (link.href.startsWith("mailto:")) {
          expect(anchor).not.toHaveAttribute("target");
        } else {
          expect(anchor).toHaveAttribute("target", "_blank");
          expect(anchor).toHaveAttribute("rel", "noopener noreferrer");
          expect(anchor.textContent).toContain(content.ui.opensInNewTab);
        }
      }
    }

    expect(screen.getByRole("link", { name: new RegExp(content.footer.source) })).toHaveAttribute(
      "href",
      "https://github.com/ruben-blok/portfolio",
    );
    expect(screen.getByRole("link", { name: content.languageSwitch.ariaLabel })).toHaveAttribute(
      "href",
      localeHref(content.languageSwitch.locale),
    );
    expect(screen.getByText(/© 2026/)).toBeInTheDocument();
  });
});
