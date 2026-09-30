import { ContactSection } from "@/components/contact-section";
import { EducationList } from "@/components/education-list";
import { Hero } from "@/components/hero";
import { ProjectIndex } from "@/components/project-index";
import { StackList } from "@/components/stack-list";

export default function Home() {
  return (
    <>
      <Hero />
      <ProjectIndex />
      <StackList />
      <EducationList />
      <ContactSection />
    </>
  );
}
