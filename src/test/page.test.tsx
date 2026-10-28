import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { SiteHeader } from "@/components/site-header";
import { navigation, profile, profileLinks } from "@/data/profile";
import { projects } from "@/data/projects";
import { stackGroups } from "@/data/stack";

vi.mock("@/components/portfolio-map", () => ({
  PortfolioMap: () => <section aria-label="Interactieve wereldkaart" />,
}));

const secties = [
  { href: "#projecten", naam: "Projecten" },
  { href: "#stack", naam: "Stack" },
  { href: "#opleiding", naam: "Opleiding" },
  { href: "#contact", naam: "Contact" },
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("portfolio pagina", () => {
  it("toont de rol en de introductie in de hero", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(profile.headline);
    expect(screen.getByText(profile.role)).toBeInTheDocument();
    expect(screen.getByText(profile.intro)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bekijk projecten" })).toHaveAttribute(
      "href",
      "#projecten",
    );
  });

  it("toont elk project met zijn stack", () => {
    render(<Home />);

    for (const project of projects) {
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
    render(<Home />);

    const projectSection = document.getElementById("projecten");
    const anchors = [...(projectSection?.querySelectorAll("a") ?? [])];

    for (const project of projects.filter((item) => item.href)) {
      const matches = anchors.filter((anchor) => anchor.getAttribute("href") === project.href);

      expect(matches.length, project.id).toBe(1);
      expect(matches[0], project.id).toHaveAttribute("rel", "noopener noreferrer");
      expect(matches[0], project.id).toHaveAttribute("target", "_blank");
      expect(matches[0]?.textContent, project.id).toContain(project.linkLabel);
    }

    const zonderLink = projects.filter((item) => !item.href);

    for (const project of zonderLink) {
      expect(
        screen.queryByRole("link", { name: new RegExp(escapeRegExp(project.title), "i") }),
        project.id,
      ).toBeNull();
    }
  });

  it("geeft elke projectrij een anker voor de kaartlinks", () => {
    render(<Home />);

    for (const project of projects) {
      expect(document.getElementById(`project-${project.id}`), project.id).not.toBeNull();
    }
  });

  it("laat elke navigatielink naar een bestaande sectie wijzen", () => {
    render(
      <>
        <SiteHeader />
        <Home />
      </>,
    );

    expect(navigation).toHaveLength(secties.length);

    for (const item of navigation) {
      const link = screen.getByRole("link", { name: item.label });

      expect(link).toHaveAttribute("href", item.href);
      expect(document.getElementById(item.href.slice(1)), item.href).not.toBeNull();
    }
  });

  it("geeft elke sectie een toegankelijke naam", () => {
    render(<Home />);

    for (const sectie of secties) {
      expect(screen.getByRole("region", { name: sectie.naam }), sectie.href).toBeInTheDocument();
    }
  });

  it("groepeert de stack onder labels", () => {
    render(<Home />);

    for (const group of stackGroups) {
      expect(screen.getByText(group.label), group.id).toBeInTheDocument();
      expect(screen.getByText(group.items.join(", ")), group.id).toBeInTheDocument();
    }
  });

  it("toont elk contactkanaal met het juiste adres", () => {
    render(<Home />);

    const hrefs = screen.getAllByRole("link").map((anchor) => anchor.getAttribute("href"));

    for (const link of profileLinks) {
      expect(hrefs, link.label).toContain(link.href);
    }
  });

  it("waarschuwt dat sociale links een nieuw tabblad openen", () => {
    render(<Home />);

    for (const link of profileLinks.filter((item) => !item.href.startsWith("mailto:"))) {
      expect(
        screen.getByRole("link", {
          name: `${link.label}, ${link.handle} (opent in een nieuw tabblad)`,
        }),
        link.label,
      ).toBeInTheDocument();
    }
  });
});
