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
      "Portfolio van Ruben Blok, junior full-stack developer in Rotterdam. Projecten, stack en contact.",
    ogLocale: "nl_NL",
  },
  profile: {
    ...profileBase,
    role: "Junior full-stack developer",
    location: "Rotterdam",
    headline: "Ik bouw webapplicaties van database tot interface.",
    intro:
      "Ik ben Ruben, student Software Development in Rotterdam. Ik bouw graag applicaties die iets ontsluiten wat anders verborgen blijft: liever duidelijke code dan slimme code.",
  },
  heroFacts: [
    {
      label: "Standplaats",
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
      tagline: "Een platform waar mensen verlaten locaties bekijken, delen en ontdekken.",
      summary:
        "AI en machine learning helpen gebruikers om plekken te vinden die ze anders nooit hadden gevonden.",
      linkLabel: "Bezoek urbexium.com",
    },
    urbexbench: {
      title: "UrbexBench",
      tagline: "Benchmark voor het herkennen van verlaten locaties op satellietbeelden.",
      summary:
        "De benchmark combineert data-analyse met een praktische evaluatie van modelkwaliteit.",
      linkLabel: "Bekijk op GitHub",
    },
    "escape-room": {
      title: "Escape room",
      tagline: "Interactieve escape room in de browser: puzzels en logica in een verlaten huis.",
      summary: "De nadruk lag op spelstructuur en een duidelijke gebruikersflow.",
      linkLabel: "Bekijk op GitHub",
    },
    ouderavond: {
      title: "Ouderavond",
      tagline: "Een informatieve website voor ouders van nieuwe leerlingen.",
      summary: "De nadruk lag op rustige presentatie en een structuur die snel te scannen is.",
      linkLabel: "Bekijk op GitHub",
    },
  }),
  stackGroups: buildStackGroups({
    talen: "Talen",
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
      relation: "Software Development",
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
      lead: "Vier projecten, van een platform voor verlaten plekken tot een benchmark voor satellietbeelden.",
    },
    stack: {
      id: "stack",
      title: "Stack",
      lead: "Waar ik mee werk, van taal tot het gereedschap eromheen.",
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
    emailMe: "E-mail mij",
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
    mobileTip: "Bekijk op desktop voor een betere ervaring.",
    loading: "Kaart wordt geladen…",
    error: "De interactieve kaart kon niet laden. Bekijk de locaties hieronder.",
    locations: "Locaties",
    locationsLegend: "Locaties op de kaart",
    prompt: "Kies een locatie om in te zoomen.",
    toProject: "Naar project",
    toProjectAbout: "over {title}",
    reset: "Terug naar de wereldkaart",
    openStreetMap: "{label} bekijken op OpenStreetMap",
  },
};
