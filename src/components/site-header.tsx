import { navigation, profile } from "@/data/profile";

export function SiteHeader() {
  return (
    <header className="border-b border-rule bg-paper md:sticky md:top-0 md:z-20">
      <div className="shell flex flex-col gap-1 py-4 md:flex-row md:items-baseline md:justify-between md:gap-8 md:py-5">
        <a
          href="#top"
          className="font-display text-[1.375rem] tracking-[-0.012em] text-ink transition-[color] duration-200 ease-settle hover:text-forest motion-reduce:transition-none"
        >
          {profile.name}
        </a>
        <nav aria-label="Secties op deze pagina">
          <ul className="flex flex-wrap gap-x-5 md:gap-x-8">
            {navigation.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-label text-soft transition-[color] duration-200 ease-settle hover:text-forest md:min-h-0 md:py-1 motion-reduce:transition-none"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
