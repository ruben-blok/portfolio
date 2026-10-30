import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { LanguageSwitch } from "@/components/language-switch";
import { getContent } from "@/content";
import { LOCALE_STORAGE_KEY, localeHref } from "@/lib/locale";

afterEach(() => {
  window.localStorage.clear();
});

describe("taalschakelaar", () => {
  it("onthoudt de keuze voor het Engels", async () => {
    const user = userEvent.setup();
    const copy = getContent("nl").languageSwitch;

    render(<LanguageSwitch copy={copy} />);

    const link = screen.getByRole("link", { name: copy.ariaLabel });

    expect(link).toHaveAttribute("href", localeHref("en"));
    expect(link).toHaveAttribute("hreflang", "en");
    expect(link).toHaveAttribute("lang", "en");
    expect(link).toHaveTextContent("English");

    link.addEventListener("click", (event) => event.preventDefault());
    await user.click(link);

    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("en");
  });

  it("onthoudt de keuze voor het Nederlands", async () => {
    const user = userEvent.setup();
    const copy = getContent("en").languageSwitch;

    render(<LanguageSwitch copy={copy} />);

    const link = screen.getByRole("link", { name: copy.ariaLabel });

    expect(link).toHaveAttribute("href", localeHref("nl"));
    expect(link).toHaveAttribute("hreflang", "nl");
    expect(link).toHaveAttribute("lang", "nl");
    expect(link).toHaveTextContent("Nederlands");

    link.addEventListener("click", (event) => event.preventDefault());
    await user.click(link);

    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("nl");
  });
});
