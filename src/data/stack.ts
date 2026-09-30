export type StackGroup = {
  id: string;
  label: string;
  items: string[];
};

export const stackGroups: StackGroup[] = [
  {
    id: "talen",
    label: "Talen",
    items: ["Python", "TypeScript", "JavaScript", "PHP", "SQL"],
  },
  {
    id: "frontend",
    label: "Frontend",
    items: ["Next.js", "React", "Tailwind CSS", "shadcn/ui", "HTML", "CSS"],
  },
  {
    id: "backend",
    label: "Backend",
    items: ["Node.js", "Hono", "Drizzle", "Better Auth", "Zod", "Stripe"],
  },
  {
    id: "data",
    label: "Data en AI",
    items: ["PostgreSQL", "MySQL / MariaDB", "OpenRouter", "Hugging Face"],
  },
  {
    id: "tooling",
    label: "Tooling",
    items: ["Git", "Docker", "Docker Compose", "pnpm", "Biome"],
  },
  {
    id: "opleveren",
    label: "Testen en opleveren",
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
