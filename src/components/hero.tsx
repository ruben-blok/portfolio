import { PortfolioMap } from "@/components/portfolio-map";
import { pointsOfInterest } from "@/data/points-of-interest";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";

export function Hero() {
  return (
    <section id="top" aria-labelledby="top-titel" className="shell hero-globe">
      <div className="grid grid-cols-1 gap-y-12 pt-14 pb-[4.5rem] md:grid-cols-12 md:gap-x-8 md:pt-20 md:pb-24 lg:pt-24">
        <div className="md:col-span-5 lg:col-span-4">
          <p className="rise rise-1 font-display text-label text-soft italic">{profile.role}</p>
          <h1
            id="top-titel"
            className="rise rise-2 mt-4 font-display text-[clamp(2.5rem,4.6vw,3.75rem)] leading-[1.02] tracking-[-0.022em] md:mt-6"
          >
            {profile.headline}
          </h1>
          <p className="rise rise-3 mt-6 max-w-[48ch] text-lead text-soft md:mt-8">
            {profile.intro}
          </p>
          <div className="rise rise-4 mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 md:mt-10">
            <a
              href="#projecten"
              className="inline-flex min-h-11 items-center bg-forest px-7 py-4 text-note font-semibold text-paper transition-[background-color,translate] duration-200 ease-settle hover:-translate-y-0.5 hover:bg-forest-deep motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Bekijk mijn projecten
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex min-h-11 items-center text-note font-medium text-soft underline decoration-rule underline-offset-[6px] transition-[color,text-decoration-color] duration-200 ease-settle hover:text-forest hover:decoration-forest motion-reduce:transition-none"
            >
              E-mail mij
            </a>
          </div>
        </div>
        <div className="rise rise-3 md:col-span-7 lg:col-span-8">
          <PortfolioMap points={pointsOfInterest} projects={projects} />
        </div>
      </div>
    </section>
  );
}
