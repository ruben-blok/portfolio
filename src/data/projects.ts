export type ProjectId = "urbexium" | "urbexbench" | "escape-room" | "ouderavond";

export type ProjectBase = {
  id: ProjectId;
  stack: string[];
  href?: string;
};

export type ProjectText = {
  title: string;
  tagline: string;
  summary: string;
  linkLabel?: string;
};

export type Project = ProjectBase & ProjectText;

export const projectBase: ProjectBase[] = [
  {
    id: "urbexium",
    stack: ["Python", "JavaScript"],
    href: "https://urbexium.com",
  },
  {
    id: "urbexbench",
    stack: ["Python"],
    href: "https://github.com/ruben-blok/urbexbench",
  },
  {
    id: "escape-room",
    stack: ["JavaScript", "PHP"],
    href: "https://github.com/ZephanvanderWeijde/LPC",
  },
  {
    id: "ouderavond",
    stack: ["HTML", "CSS"],
    href: "https://github.com/TechniekCollegeRotterdam/project-p1-ouderavond-sod1c-westland",
  },
];
