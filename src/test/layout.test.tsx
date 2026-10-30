import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RootShell } from "@/components/root-shell";
import { getContent } from "@/content";

describe("root shell", () => {
  it("zet de taal en de gedeelde chrome voor de Nederlandse pagina", () => {
    const content = getContent("nl");
    const html = renderToStaticMarkup(
      <RootShell content={content} fontClassName="font-test">
        <p>Body</p>
      </RootShell>,
    );

    expect(html).toContain('<html lang="nl" class="font-test">');
    expect(html).toContain(content.ui.skipToContent);
    expect(html).toContain('id="main"');
    expect(html).toContain(content.profile.name);
    expect(html).toContain(content.ui.backToTop);
    expect(html).toContain("portfolio-locale");
  });

  it("zet de taal van de Engelse pagina zonder redirectscript", () => {
    const content = getContent("en");
    const html = renderToStaticMarkup(
      <RootShell content={content} fontClassName="font-test">
        <p>Body</p>
      </RootShell>,
    );

    expect(html).toContain('<html lang="en" class="font-test">');
    expect(html).toContain(content.ui.skipToContent);
    expect(html).toContain(content.profile.name);
    expect(html).not.toContain("portfolio-locale");
  });
});
