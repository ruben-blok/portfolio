import type { EducationEntry } from "@/data/education";
import type { PointOfInterest } from "@/data/points-of-interest";
import type { ProfileLink } from "@/data/profile";
import type { Project } from "@/data/projects";
import type { StackGroup } from "@/data/stack";
import type { Locale } from "@/lib/locale";

export type { Locale } from "@/lib/locale";

export type HeroFact = {
  label: string;
  value: string;
};

export type NavigationItem = {
  label: string;
  href: string;
};

export type SectionCopy = {
  id: string;
  title: string;
  lead: string;
};

export type LanguageSwitchCopy = {
  label: string;
  ariaLabel: string;
  locale: Locale;
};

export type MapCopy = {
  regionLabel: string;
  instructions: string;
  mobileTip: string;
  loading: string;
  error: string;
  locations: string;
  locationsLegend: string;
  prompt: string;
  toProject: string;
  toProjectAbout: string;
  reset: string;
  openStreetMap: string;
};

export type SiteContent = {
  locale: Locale;
  meta: {
    title: string;
    description: string;
    ogLocale: string;
  };
  profile: {
    name: string;
    email: string;
    role: string;
    location: string;
    headline: string;
    intro: string;
  };
  heroFacts: HeroFact[];
  navigation: NavigationItem[];
  profileLinks: ProfileLink[];
  projects: Project[];
  stackGroups: StackGroup[];
  education: EducationEntry[];
  pointsOfInterest: PointOfInterest[];
  sections: {
    projects: SectionCopy;
    stack: SectionCopy;
    education: SectionCopy;
    contact: SectionCopy;
  };
  ui: {
    skipToContent: string;
    backToTop: string;
    opensInNewTab: string;
    viewProjects: string;
    emailMe: string;
    sectionsNavLabel: string;
    languageNavLabel: string;
    stackLabel: string;
  };
  languageSwitch: LanguageSwitchCopy;
  map: MapCopy;
};
