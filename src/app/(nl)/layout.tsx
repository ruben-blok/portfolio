import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import "@/app/globals.css";
import { fontClassName } from "@/app/fonts";
import { RootShell } from "@/components/root-shell";
import { getContent } from "@/content";
import { buildMetadata, siteViewport } from "@/content/metadata";

export const metadata: Metadata = buildMetadata("nl");
export const viewport: Viewport = siteViewport;

export default function DutchLayout({ children }: { children: ReactNode }) {
  return (
    <RootShell content={getContent("nl")} fontClassName={fontClassName}>
      {children}
    </RootShell>
  );
}
