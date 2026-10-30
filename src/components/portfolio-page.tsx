import { ContactSection } from "@/components/contact-section";
import { EducationList } from "@/components/education-list";
import { Hero } from "@/components/hero";
import { ProjectIndex } from "@/components/project-index";
import { StackList } from "@/components/stack-list";
import type { SiteContent } from "@/content/types";

export function PortfolioPage({ content }: { content: SiteContent }) {
  return (
    <>
      <Hero content={content} />
      <ProjectIndex content={content} />
      <StackList content={content} />
      <EducationList content={content} />
      <ContactSection content={content} />
    </>
  );
}
