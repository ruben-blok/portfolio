export type Capability = {
  id: string;
  title: string;
  body: string;
};

export type ApproachStep = {
  step: string;
  title: string;
  body: string;
};

export const capabilities: Capability[] = [
  {
    id: "bouwen",
    title: "Webapplicaties bouwen",
    body: "Van datamodel tot interface. Ik zet een idee om in iets dat werkt: een database die klopt, logica die je kunt volgen en een interface die je zonder uitleg begrijpt.",
  },
  {
    id: "ai",
    title: "AI inzetten waar het iets oplevert",
    body: "Ik gebruik taalmodellen en machine learning niet omdat het kan, maar omdat het een taak sneller maakt. Beelden classificeren, aanbevelingen doen, informatie doorzoekbaar maken.",
  },
  {
    id: "onderhouden",
    title: "Code begrijpelijk houden",
    body: "Ik schrijf liever duidelijke code dan slimme code. Consistente naamgeving, tests waar ze iets bewijzen en een structuur waar een ander later verder mee kan.",
  },
];

export const approach: ApproachStep[] = [
  {
    step: "01",
    title: "Begrijpen",
    body: "Eerst uitzoeken wat het probleem echt is en wie er last van heeft. De vraag blijkt achteraf vaak anders dan hij in het begin leek.",
  },
  {
    step: "02",
    title: "Afbakenen",
    body: "Bepalen wat er in de eerste versie zit en wat nog niet. Liever klein en werkend dan alles tegelijk en half.",
  },
  {
    step: "03",
    title: "Bouwen",
    body: "Datamodel, logica en interface in die volgorde. Ik test onderweg in plaats van alles aan het eind.",
  },
  {
    step: "04",
    title: "Opleveren",
    body: "Uitrollen, nakijken of het echt werkt op een ander apparaat, en de code zo achterlaten dat een volgende er verder mee kan.",
  },
];
