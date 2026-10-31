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
      "Ruben Blok is a junior full-stack developer in Westland. See projects across web, data and AI.",
    ogLocale: "en_US",
  },
  profile: {
    ...profileBase,
    role: "Junior full-stack developer",
    location: "Westland",
    headline: "I build web applications from database to interface.",
    intro:
      "I'm Ruben, a Software Development student in Rotterdam. I build applications that make hidden information visible.",
  },
  heroFacts: [
    {
      label: "Based in",
      value: "Westland",
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
      tagline: "A platform to discover, view and share abandoned locations.",
      summary:
        "AI helps users search more precisely and find locations that would otherwise stay hidden.",
      linkLabel: "Visit urbexium.com",
    },
    urbexbench: {
      title: "UrbexBench",
      tagline: "A benchmark for recognizing abandoned locations in satellite imagery.",
      summary:
        "The benchmark compares vision-language models on the same set of satellite images and sets accuracy against cost.",
      linkLabel: "View on GitHub",
    },
    "escape-room": {
      title: "Escape room",
      tagline:
        "An interactive escape room in the browser: puzzles and logic in an abandoned house.",
      summary: "The game has a clear structure and a logical progression.",
      linkLabel: "View on GitHub",
    },
    ouderavond: {
      title: "Parents' evening",
      tagline: "A website for parents of new students, explaining how the school works.",
      summary:
        "The information is split into short, recognizable sections so parents can quickly find what they need.",
      linkLabel: "View on GitHub",
    },
  }),
  stackGroups: buildStackGroups({
    talen: "Programming languages",
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
      programme: "Havo (senior general secondary education)",
      period: "2021 – 2025",
    },
  }),
  pointsOfInterest: buildPointsOfInterest({
    "techniek-college-schiedam": {
      label: "Techniek College Rotterdam",
      location: "Schiedam",
      relation: "Where I study Software Development.",
    },
    "urbexium-germany": {
      label: "Urbexium",
      location: "Germany",
      relation: "Hosted on a VPS",
    },
    westland: {
      label: "Westland",
      location: "Netherlands",
      relation: "This is where I live",
    },
  }),
  sections: {
    projects: {
      id: "projects",
      title: "Projects",
      lead: "Projects where web, data and AI come together, such as a platform for abandoned locations and a benchmark for satellite imagery.",
    },
    stack: {
      id: "stack",
      title: "Stack",
      lead: "What I build with: languages, frameworks, data and tools.",
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
    mobileTip: "The map is easiest to use on a larger screen.",
    loading: "Loading map…",
    error: "The map could not be loaded. View the locations below.",
    locations: "Locations",
    locationsLegend: "Locations on the map",
    prompt: "Choose a location to zoom in.",
    toProject: "Go to project",
    toProjectAbout: "about {title}",
    reset: "Back to the world map",
    openStreetMap: "View {label} on OpenStreetMap",
  },
};
