export type ProfileLink = {
  label: string;
  href: string;
  handle: string;
};

export type HeroFact = {
  label: string;
  value: string;
};

export const profile = {
  name: "Ruben Blok",
  role: "Junior full-stack developer",
  location: "Rotterdam",
  headline: "Ik bouw webapplicaties van database tot interface.",
  intro:
    "Ik ben Ruben, student Software Development aan het Techniek College Rotterdam. Ik werk graag aan projecten die iets ontsluiten wat anders verborgen blijft: verlaten locaties, satellietbeelden, informatie die mensen nodig hebben. Liever duidelijke code dan slimme code.",
  email: "ruben.blok36@gmail.com",
} as const;

export const heroFacts: HeroFact[] = [
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
];

export const profileLinks: ProfileLink[] = [
  {
    label: "E-mail",
    href: `mailto:${profile.email}`,
    handle: profile.email,
  },
  {
    label: "GitHub",
    href: "https://github.com/ruben-blok",
    handle: "github.com/ruben-blok",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ruben-blok-069597389/",
    handle: "linkedin.com/in/ruben-blok",
  },
  {
    label: "Hugging Face",
    href: "https://huggingface.co/ruben-blok",
    handle: "huggingface.co/ruben-blok",
  },
];

export const socialLinks = profileLinks.filter((link) => !link.href.startsWith("mailto:"));

export const navigation = [
  { label: "Projecten", href: "#projecten" },
  { label: "Stack", href: "#stack" },
  { label: "Opleiding", href: "#opleiding" },
  { label: "Contact", href: "#contact" },
];
