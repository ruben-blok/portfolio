import type { ReactNode } from "react";
import { LocaleRedirect } from "@/components/locale-redirect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { SiteContent } from "@/content/types";

type RootShellProps = {
  content: SiteContent;
  fontClassName: string;
  children: ReactNode;
};

export function RootShell({ content, fontClassName, children }: RootShellProps) {
  return (
    <html lang={content.locale} className={fontClassName}>
      <body>
        {content.locale === "nl" ? <LocaleRedirect /> : null}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-5 focus:z-50 focus:bg-forest focus:px-5 focus:py-3 focus:text-note focus:font-medium focus:text-paper"
        >
          {content.ui.skipToContent}
        </a>
        <SiteHeader content={content} />
        <main id="main">{children}</main>
        <SiteFooter content={content} />
      </body>
    </html>
  );
}
