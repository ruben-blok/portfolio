export type StackGroupId = "talen" | "frontend" | "backend" | "data" | "tooling" | "opleveren";

export type StackGroupBase = {
  id: StackGroupId;
  items: string[];
};

export type StackGroup = StackGroupBase & {
  label: string;
};

export const stackGroupBase: StackGroupBase[] = [
  {
    id: "talen",
    items: ["Python", "TypeScript", "JavaScript", "PHP", "SQL"],
  },
  {
    id: "frontend",
    items: ["Next.js", "React", "Tailwind CSS", "shadcn/ui", "HTML", "CSS"],
  },
  {
    id: "backend",
    items: ["Node.js", "Hono", "Drizzle", "Better Auth", "Zod", "Stripe"],
  },
  {
    id: "data",
    items: ["PostgreSQL", "MySQL / MariaDB", "OpenRouter", "Hugging Face"],
  },
  {
    id: "tooling",
    items: ["Git", "Docker", "Docker Compose", "pnpm", "Biome"],
  },
  {
    id: "opleveren",
    items: ["Vitest", "Playwright", "GitHub Actions"],
  },
];

export const bandItems: string[] = [
  "Python",
  "TypeScript",
  "JavaScript",
  "PHP",
  "SQL",
  "Next.js",
  "React",
  "Tailwind CSS",
  "Node.js",
  "Hono",
  "Drizzle",
  "Better Auth",
  "Zod",
  "PostgreSQL",
  "MySQL",
  "Docker",
  "Git",
  "Vitest",
  "Playwright",
  "Biome",
  "OpenRouter",
  "Stripe",
];
