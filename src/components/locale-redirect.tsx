import { localeRedirectScript } from "@/lib/locale";

export function LocaleRedirect() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  // biome-ignore lint/security/noDangerouslySetInnerHtml: The script is a fixed template plus a build-time base path.
  return <script dangerouslySetInnerHTML={{ __html: localeRedirectScript(basePath) }} />;
}
