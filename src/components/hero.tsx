"use client";

import { PortfolioMap } from "@/components/portfolio-map";
import { pointsOfInterest } from "@/data/points-of-interest";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";

export function Hero() {
  return (
    <section id="top" aria-labelledby="top-titel" className="shell hero-globe">
      <div className="hero-grid grid grid-cols-1 pt-12 md:pt-16 lg:grid-cols-12 lg:gap-x-8 lg:pt-24">
        <div className="hero-copy max-w-[34rem] pb-10 md:pb-12 lg:col-span-5 lg:max-w-none lg:pb-16">
          <p className="text-label font-medium text-soft">{profile.role}</p>
          <h1
            id="top-titel"
            className="mt-5 max-w-[18ch] font-display text-[clamp(2.5rem,4.2vw,3.5rem)] leading-[1.02] tracking-[-0.022em] lg:mt-6"
          >
            {profile.headline}
          </h1>
          <p className="mt-6 max-w-[42ch] text-copy text-soft md:mt-8">{profile.intro}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <a
              href="#projecten"
              className="inline-flex min-h-11 items-center bg-forest px-7 py-4 text-note font-semibold text-paper transition-[background-color] duration-200 ease-settle hover:bg-forest-deep motion-reduce:transition-none"
            >
              Bekijk projecten
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex min-h-11 items-center text-note font-medium text-soft underline decoration-rule underline-offset-[6px] transition-[color,text-decoration-color] duration-200 ease-settle hover:text-forest hover:decoration-forest motion-reduce:transition-none"
            >
              E-mail mij
            </a>
          </div>
        </div>

        {/*
          Invisible layout anchor for the map camera: the globe is positioned in the
          right-hand column at desktop, but the map itself paints behind the whole hero.
        */}
        <div className="hero-map-anchor" aria-hidden="true" />

        <div className="hero-map">
          <PortfolioMap points={pointsOfInterest} projects={projects} />
        </div>
      </div>
    </section>
  );
}
