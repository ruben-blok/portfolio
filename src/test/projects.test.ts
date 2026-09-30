import { describe, expect, it } from "vitest";
import { projects } from "@/data/projects";

describe("projectgegevens", () => {
  it("geeft elk project een titel, samenvatting en stack", () => {
    for (const project of projects) {
      expect(project.title.trim(), project.id).not.toBe("");
      expect(project.summary.trim(), project.id).not.toBe("");
      expect(project.stack.length, project.id).toBeGreaterThan(0);
    }
  });

  it("gebruikt unieke id's", () => {
    const ids = projects.map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("koppelt elke externe link aan een label en een https-url", () => {
    for (const project of projects) {
      if (!project.href) {
        expect(project.linkLabel, project.id).toBeUndefined();
        continue;
      }

      expect(project.href, project.id).toMatch(/^https:\/\//);
      expect(project.linkLabel?.trim(), project.id).not.toBe("");
    }
  });

  it("gebruikt geen dubbele projectlinks", () => {
    const hrefs = projects.flatMap((project) => (project.href ? [project.href] : []));
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
