import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PortfolioPage } from "@/components/portfolio-page";
import { SiteHeader } from "@/components/site-header";
import { getContent } from "@/content";
import { localeHref } from "@/lib/locale";

vi.mock("@/components/portfolio-map", () => ({
  PortfolioMap: () => <section data-testid="portfolio-map" />,
}));

const locales = ["nl", "en"] as const;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe.each(locales)("portfolio pagina (%s)", (locale) => {
  const content = getContent(locale);

  it("toont de rol en de introductie in de hero", () => {
    render(<PortfolioPage content={content} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(content.profile.headline);
    expect(screen.getByText(content.profile.role)).toBeInTheDocument();
    expect(screen.getByText(content.profile.intro)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: content.ui.viewProjects })).toHaveAttribute(
      "href",
      `#${content.sections.projects.id}`,
    );
  });

  it("toont elk project met zijn stack", () => {
    render(<PortfolioPage content={content} />);

    for (const project of content.projects) {
      expect(
        screen.getByRole("heading", { level: 3, name: project.title }),
        project.id,
      ).toBeInTheDocument();

      for (const techniek of project.stack) {
        expect(
          screen.getAllByText(new RegExp(escapeRegExp(techniek))).length,
          techniek,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("maakt alleen van een project met een link een echte link", () => {
    render(<PortfolioPage content={content} />);

    const projectSection = document.getElementById(content.sections.projects.id);
    const anchors = [...(projectSection?.querySelectorAll("a") ?? [])];

    for (const project of content.projects.filter((item) => item.href)) {
      const matches = anchors.filter((anchor) => anchor.getAttribute("href") === project.href);

      expect(matches.length, project.id).toBe(1);
      expect(matches[0], project.id).toHaveAttribute("rel", "noopener noreferrer");
      expect(matches[0], project.id).toHaveAttribute("target", "_blank");
      expect(matches[0]?.textContent, project.id).toContain(project.linkLabel);
      expect(matches[0]?.textContent, project.id).toContain(content.ui.opensInNewTab);
    }

    const zonderLink = content.projects.filter((item) => !item.href);

    for (const project of zonderLink) {
      expect(
        screen.queryByRole("link", { name: new RegExp(escapeRegExp(project.title), "i") }),
        project.id,
      ).toBeNull();
    }
  });

  it("geeft elke projectrij een anker voor de kaartlinks", () => {
    render(<PortfolioPage content={content} />);

    for (const project of content.projects) {
      expect(document.getElementById(`project-${project.id}`), project.id).not.toBeNull();
    }
  });

  it("laat elke navigatielink naar een bestaande sectie wijzen", () => {
    render(
      <>
        <SiteHeader content={content} />
        <PortfolioPage content={content} />
      </>,
    );

    expect(
      screen.getByRole("navigation", { name: content.ui.sectionsNavLabel }),
    ).toBeInTheDocument();

    for (const item of content.navigation) {
      const link = screen.getByRole("link", { name: item.label });

      expect(link).toHaveAttribute("href", item.href);
      expect(document.getElementById(item.href.slice(1)), item.href).not.toBeNull();
    }
  });

  it("geeft elke sectie een toegankelijke naam", () => {
    render(<PortfolioPage content={content} />);

    for (const section of Object.values(content.sections)) {
      expect(screen.getByRole("region", { name: section.title }), section.id).toBeInTheDocument();
    }
  });

  it("groepeert de stack onder labels", () => {
    render(<PortfolioPage content={content} />);

    for (const group of content.stackGroups) {
      expect(screen.getByText(group.label), group.id).toBeInTheDocument();
      expect(screen.getByText(group.items.join(", ")), group.id).toBeInTheDocument();
    }
  });

  it("toont elk contactkanaal met het juiste adres", () => {
    render(<PortfolioPage content={content} />);

    const hrefs = screen.getAllByRole("link").map((anchor) => anchor.getAttribute("href"));

    for (const link of content.profileLinks) {
      expect(hrefs, link.label).toContain(link.href);
    }
  });

  it("waarschuwt dat sociale links een nieuw tabblad openen", () => {
    render(<PortfolioPage content={content} />);

    for (const link of content.profileLinks.filter((item) => !item.href.startsWith("mailto:"))) {
      expect(
        screen.getByRole("link", {
          name: `${link.label}, ${link.handle} ${content.ui.opensInNewTab}`,
        }),
        link.label,
      ).toBeInTheDocument();
    }
  });

  it("toont een taalschakelaar naar de andere versie", () => {
    render(
      <>
        <SiteHeader content={content} />
        <PortfolioPage content={content} />
      </>,
    );

    expect(
      screen.getByRole("navigation", { name: content.ui.languageNavLabel }),
    ).toBeInTheDocument();

    const link = screen.getByRole("link", { name: content.languageSwitch.ariaLabel });

    expect(link).toHaveAttribute("href", localeHref(content.languageSwitch.locale));
    expect(link).toHaveAttribute("hreflang", content.languageSwitch.locale);
    expect(link).toHaveAttribute("lang", content.languageSwitch.locale);
    expect(link).toHaveTextContent(content.languageSwitch.label);
  });
});
