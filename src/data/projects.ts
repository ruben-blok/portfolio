export type Project = {
  id: string;
  title: string;
  summary: string;
  stack: string[];
  href?: string;
  linkLabel?: string;
};

export const projects: Project[] = [
  {
    id: "urbexium",
    title: "Urbexium",
    summary:
      "Een platform waar mensen verlaten locaties bekijken, delen en ontdekken. AI en machine learning helpen gebruikers om plekken te vinden die ze anders nooit hadden gevonden.",
    stack: ["Python", "JavaScript"],
    href: "https://keeponrolling.nl",
    linkLabel: "Bezoek keeponrolling.nl",
  },
  {
    id: "urbexbench",
    title: "UrbexBench",
    summary:
      "Een benchmark die meet hoe goed visuele taalmodellen verlaten en niet-verlaten locaties op satellietbeelden van elkaar onderscheiden. Het combineert data-analyse met een praktische evaluatie van modelkwaliteit.",
    stack: ["Python"],
    href: "https://github.com/ruben-blok/urbexbench",
    linkLabel: "Bekijk op GitHub",
  },
  {
    id: "escape-room",
    title: "Escape room",
    summary:
      "Een interactieve escape room in de browser: een verlaten huis, puzzels en logica die spelers verder brengen. De nadruk lag op spelstructuur en een duidelijke gebruikersflow.",
    stack: ["JavaScript", "PHP"],
    href: "https://github.com/ZephanvanderWeijde/LPC",
    linkLabel: "Bekijk op GitHub",
  },
  {
    id: "ouderavond",
    title: "Ouderavond",
    summary:
      "Een informatieve website voor ouders van nieuwe leerlingen, met de nadruk op rustige presentatie en een structuur die snel te scannen is.",
    stack: ["HTML", "CSS"],
    href: "https://github.com/TechniekCollegeRotterdam/project-p1-ouderavond-sod1c-westland",
    linkLabel: "Bekijk op GitHub",
  },
];
