import { PortfolioPage } from "@/components/portfolio-page";
import { getContent } from "@/content";

export default function DutchHome() {
  return <PortfolioPage content={getContent("nl")} />;
}
