import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import "@/app/globals.css";
import { fontClassName } from "@/app/fonts";
import { RootShell } from "@/components/root-shell";
import { getContent } from "@/content";
import { buildMetadata, siteViewport } from "@/content/metadata";

export const metadata: Metadata = buildMetadata("en");
export const viewport: Viewport = siteViewport;

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return (
    <RootShell content={getContent("en")} fontClassName={fontClassName}>
      {children}
    </RootShell>
  );
}
