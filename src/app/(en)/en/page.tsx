import { PortfolioPage } from "@/components/portfolio-page";
import { getContent } from "@/content";

export default function EnglishHome() {
  return <PortfolioPage content={getContent("en")} />;
}
