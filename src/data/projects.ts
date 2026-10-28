export type Project = {
  id: string;
  title: string;
  tagline: string;
  summary: string;
  stack: string[];
  href?: string;
  linkLabel?: string;
};

export const projects: Project[] = [
  {
    id: "urbexium",
    title: "Urbexium",
    tagline: "Een platform waar mensen verlaten locaties bekijken, delen en ontdekken.",
    summary:
      "AI en machine learning helpen gebruikers om plekken te vinden die ze anders nooit hadden gevonden.",
    stack: ["Python", "JavaScript"],
    href: "https://keeponrolling.nl",
    linkLabel: "Bezoek keeponrolling.nl",
  },
  {
    id: "urbexbench",
    title: "UrbexBench",
    tagline: "Benchmark voor het herkennen van verlaten locaties op satellietbeelden.",
    summary:
      "De benchmark combineert data-analyse met een praktische evaluatie van modelkwaliteit.",
    stack: ["Python"],
    href: "https://github.com/ruben-blok/urbexbench",
    linkLabel: "Bekijk op GitHub",
  },
  {
    id: "escape-room",
    title: "Escape room",
    tagline: "Interactieve escape room in de browser: puzzels en logica in een verlaten huis.",
    summary: "De nadruk lag op spelstructuur en een duidelijke gebruikersflow.",
    stack: ["JavaScript", "PHP"],
    href: "https://github.com/ZephanvanderWeijde/LPC",
    linkLabel: "Bekijk op GitHub",
  },
  {
    id: "ouderavond",
    title: "Ouderavond",
    tagline: "Een informatieve website voor ouders van nieuwe leerlingen.",
    summary: "De nadruk lag op rustige presentatie en een structuur die snel te scannen is.",
    stack: ["HTML", "CSS"],
    href: "https://github.com/TechniekCollegeRotterdam/project-p1-ouderavond-sod1c-westland",
    linkLabel: "Bekijk op GitHub",
  },
];
