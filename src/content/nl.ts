import {
  buildEducation,
  buildPointsOfInterest,
  buildProfileLinks,
  buildProjects,
  buildStackGroups,
} from "@/content/build";
import type { SiteContent } from "@/content/types";
import { profileBase } from "@/data/profile";

export const nlContent: SiteContent = {
  locale: "nl",
  meta: {
    title: "Ruben Blok — Junior full-stack developer",
    description:
      "Ruben Blok is junior full-stack developer in Rotterdam. Bekijk projecten op het snijvlak van web, data en AI.",
    ogLocale: "nl_NL",
  },
  profile: {
    ...profileBase,
    role: "Junior full-stack developer",
    location: "Rotterdam",
    headline: "Ik bouw webapplicaties van database tot interface.",
    intro:
      "Ik ben Ruben, student Software Development in Rotterdam. Ik bouw graag applicaties die verborgen informatie zichtbaar maken.",
  },
  heroFacts: [
    {
      label: "Locatie",
      value: "Rotterdam",
    },
    {
      label: "Opleiding",
      value: "Software Development, Techniek College Rotterdam",
    },
    {
      label: "Focus",
      value: "Webapplicaties, data en AI",
    },
  ],
  navigation: [
    { label: "Projecten", href: "#projecten" },
    { label: "Stack", href: "#stack" },
    { label: "Opleiding", href: "#opleiding" },
    { label: "Contact", href: "#contact" },
  ],
  profileLinks: buildProfileLinks({
    email: "E-mail",
    github: "GitHub",
    linkedin: "LinkedIn",
    huggingface: "Hugging Face",
  }),
  projects: buildProjects({
    urbexium: {
      title: "Urbexium",
      tagline: "Een platform om verlaten locaties te ontdekken, bekijken en delen.",
      summary:
        "AI helpt gebruikers gerichter te zoeken en locaties te vinden die anders verborgen blijven.",
      linkLabel: "Bezoek urbexium.com",
    },
    urbexbench: {
      title: "UrbexBench",
      tagline: "Benchmark voor het herkennen van verlaten locaties op satellietbeelden.",
      summary:
        "De benchmark vergelijkt visuele taalmodellen op dezelfde set satellietbeelden en zet nauwkeurigheid naast kosten.",
      linkLabel: "Bekijk op GitHub",
    },
    "escape-room": {
      title: "Escape room",
      tagline: "Interactieve escape room in de browser: puzzels en logica in een verlaten huis.",
      summary: "Het spel heeft een heldere structuur en een logische opbouw.",
      linkLabel: "Bekijk op GitHub",
    },
    ouderavond: {
      title: "Ouderavond",
      tagline:
        "Een website voor ouders van nieuwe leerlingen, met uitleg over hoe de school werkt.",
      summary:
        "De informatie staat in korte, herkenbare blokken, zodat ouders snel vinden wat ze nodig hebben.",
      linkLabel: "Bekijk op GitHub",
    },
  }),
  stackGroups: buildStackGroups({
    talen: "Programmeertalen",
    frontend: "Frontend",
    backend: "Backend",
    data: "Data en AI",
    tooling: "Tooling",
    opleveren: "Testen en opleveren",
  }),
  education: buildEducation({
    mbo: {
      programme: "Software Development",
      period: "2025 – heden",
    },
    havo: {
      programme: "Havo",
      period: "2021 – 2025",
    },
  }),
  pointsOfInterest: buildPointsOfInterest({
    "techniek-college-schiedam": {
      label: "Techniek College Rotterdam",
      location: "Schiedam",
      relation: "Hier studeer ik Software Development.",
    },
    "urbexium-germany": {
      label: "Urbexium",
      location: "Duitsland",
      relation: "Gehost op een VPS",
    },
  }),
  sections: {
    projects: {
      id: "projecten",
      title: "Projecten",
      lead: "Projecten waarin web, data en AI samenkomen, zoals een platform voor verlaten locaties en een benchmark voor satellietbeelden.",
    },
    stack: {
      id: "stack",
      title: "Stack",
      lead: "Waar ik mee bouw: talen, frameworks, data en tools.",
    },
    education: {
      id: "opleiding",
      title: "Opleiding",
      lead: "Van havo naar software development.",
    },
    contact: {
      id: "contact",
      title: "Contact",
      lead: "Voor een stage, een samenwerking of een vraag over een van mijn projecten.",
    },
  },
  ui: {
    skipToContent: "Direct naar inhoud",
    backToTop: "Terug naar boven",
    opensInNewTab: "(opent in een nieuw tabblad)",
    viewProjects: "Bekijk projecten",
    emailMe: "Stuur een e-mail",
    sectionsNavLabel: "Secties op deze pagina",
    languageNavLabel: "Taal",
    stackLabel: "Stack",
  },
  languageSwitch: {
    label: "English",
    ariaLabel: "Schakel over naar Engels",
    locale: "en",
  },
  map: {
    regionLabel: "Interactieve wereldkaart",
    instructions: "Gebruik de pijltoetsen om de kaart te verplaatsen en plus of min om te zoomen.",
    mobileTip: "De kaart is het prettigst op een groot scherm.",
    loading: "Kaart wordt geladen…",
    error: "De kaart kon niet worden geladen. Bekijk de locaties hieronder.",
    locations: "Locaties",
    locationsLegend: "Locaties op de kaart",
    prompt: "Kies een locatie om in te zoomen.",
    toProject: "Naar project",
    toProjectAbout: "over {title}",
    reset: "Terug naar de wereldkaart",
    openStreetMap: "{label} bekijken op OpenStreetMap",
  },
};
