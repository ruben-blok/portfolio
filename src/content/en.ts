import {
  buildEducation,
  buildPointsOfInterest,
  buildProfileLinks,
  buildProjects,
  buildStackGroups,
} from "@/content/build";
import type { SiteContent } from "@/content/types";
import { profileBase } from "@/data/profile";

export const enContent: SiteContent = {
  locale: "en",
  meta: {
    title: "Ruben Blok — Junior full-stack developer",
    description:
      "Portfolio of Ruben Blok, junior full-stack developer in Rotterdam. Projects, stack and contact.",
    ogLocale: "en_US",
  },
  profile: {
    ...profileBase,
    role: "Junior full-stack developer",
    location: "Rotterdam",
    headline: "I build web applications from database to interface.",
    intro:
      "I am Ruben, a Software Development student in Rotterdam. I like building applications that reveal something that would otherwise stay hidden: clear code over clever code.",
  },
  heroFacts: [
    {
      label: "Based in",
      value: "Rotterdam",
    },
    {
      label: "Education",
      value: "Software Development, Techniek College Rotterdam",
    },
    {
      label: "Focus",
      value: "Web applications, data and AI",
    },
  ],
  navigation: [
    { label: "Projects", href: "#projects" },
    { label: "Stack", href: "#stack" },
    { label: "Education", href: "#education" },
    { label: "Contact", href: "#contact" },
  ],
  profileLinks: buildProfileLinks({
    email: "Email",
    github: "GitHub",
    linkedin: "LinkedIn",
    huggingface: "Hugging Face",
  }),
  projects: buildProjects({
    urbexium: {
      title: "Urbexium",
      tagline: "A platform where people view, share and discover abandoned locations.",
      summary:
        "AI and machine learning help users find places they would otherwise never have found.",
      linkLabel: "Visit urbexium.com",
    },
    urbexbench: {
      title: "UrbexBench",
      tagline: "A benchmark for recognizing abandoned locations in satellite imagery.",
      summary: "The benchmark combines data analysis with a practical evaluation of model quality.",
      linkLabel: "View on GitHub",
    },
    "escape-room": {
      title: "Escape room",
      tagline:
        "An interactive escape room in the browser: puzzles and logic in an abandoned house.",
      summary: "The focus was on game structure and a clear user flow.",
      linkLabel: "View on GitHub",
    },
    ouderavond: {
      title: "Parents' evening",
      tagline: "An informative website for parents of new students.",
      summary: "The focus was on calm presentation and a structure that is quick to scan.",
      linkLabel: "View on GitHub",
    },
  }),
  stackGroups: buildStackGroups({
    talen: "Languages",
    frontend: "Frontend",
    backend: "Backend",
    data: "Data and AI",
    tooling: "Tooling",
    opleveren: "Testing and delivery",
  }),
  education: buildEducation({
    mbo: {
      programme: "Software Development",
      period: "2025 – present",
    },
    havo: {
      programme: "Senior general secondary education (havo)",
      period: "2021 – 2025",
    },
  }),
  pointsOfInterest: buildPointsOfInterest({
    "techniek-college-schiedam": {
      label: "Techniek College Rotterdam",
      location: "Schiedam",
      relation: "Software Development",
    },
    "urbexium-germany": {
      label: "Urbexium",
      location: "Germany",
      relation: "Hosted on a VPS",
    },
  }),
  sections: {
    projects: {
      id: "projects",
      title: "Projects",
      lead: "Four projects, from a platform for abandoned places to a benchmark for satellite imagery.",
    },
    stack: {
      id: "stack",
      title: "Stack",
      lead: "What I work with, from languages to the tooling around them.",
    },
    education: {
      id: "education",
      title: "Education",
      lead: "From secondary school to software development.",
    },
    contact: {
      id: "contact",
      title: "Contact",
      lead: "For an internship, a collaboration or a question about one of my projects.",
    },
  },
  ui: {
    skipToContent: "Skip to content",
    backToTop: "Back to top",
    opensInNewTab: "(opens in a new tab)",
    viewProjects: "View projects",
    emailMe: "Email me",
    sectionsNavLabel: "Sections on this page",
    languageNavLabel: "Language",
    stackLabel: "Stack",
  },
  languageSwitch: {
    label: "Nederlands",
    ariaLabel: "Switch to Dutch",
    locale: "nl",
  },
  map: {
    regionLabel: "Interactive world map",
    instructions: "Use the arrow keys to move the map and plus or minus to zoom.",
    mobileTip: "View on desktop for a better experience.",
    loading: "Loading map…",
    error: "The interactive map could not load. View the locations below.",
    locations: "Locations",
    locationsLegend: "Locations on the map",
    prompt: "Choose a location to zoom in.",
    toProject: "Go to project",
    toProjectAbout: "about {title}",
    reset: "Back to the world map",
    openStreetMap: "View {label} on OpenStreetMap",
  },
};
