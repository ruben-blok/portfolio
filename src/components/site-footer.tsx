import { profile } from "@/data/profile";

export function SiteFooter() {
  return (
    <footer className="tone-forest-deep border-t border-rule">
      <div className="shell flex flex-col gap-4 py-10 md:flex-row md:items-baseline md:justify-between md:gap-8 md:py-12">
        <p className="text-note text-soft">
          © {new Date().getFullYear()} {profile.name}, {profile.location}
        </p>
        <p>
          <a
            href="#top"
            className="inline-flex min-h-11 items-center text-note text-soft underline decoration-rule underline-offset-4 transition-[color,text-decoration-color] duration-200 ease-settle hover:text-paper hover:decoration-paper md:min-h-0 motion-reduce:transition-none"
          >
            Terug naar boven
          </a>
        </p>
      </div>
    </footer>
  );
}
