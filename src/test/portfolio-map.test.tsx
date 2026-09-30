import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PortfolioMap } from "@/components/portfolio-map";
import { pointsOfInterest } from "@/data/points-of-interest";
import { projects } from "@/data/projects";

const mapMocks = vi.hoisted(() => {
  const handlers = new Map<string, Array<(event?: { error?: Error }) => void>>();
  const map = {
    setProjection: vi.fn(),
    addControl: vi.fn(),
    on: vi.fn((event: string, handler: (event?: { error?: Error }) => void) => {
      handlers.set(event, [...(handlers.get(event) ?? []), handler]);
    }),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    getZoom: vi.fn(() => 1.35),
    setMaxZoom: vi.fn(),
    flyTo: vi.fn(),
    jumpTo: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    isStyleLoaded: vi.fn(() => true),
    resize: vi.fn(),
    remove: vi.fn(),
  };

  return {
    handlers,
    map,
    Map: vi.fn(() => map),
    Marker: vi.fn(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      getElement: vi.fn(() => document.createElement("button")),
      remove: vi.fn(),
    })),
    AttributionControl: vi.fn(),
    setWorkerUrl: vi.fn(),
  };
});

vi.mock("maplibre-gl", () => ({
  Map: mapMocks.Map,
  Marker: mapMocks.Marker,
  AttributionControl: mapMocks.AttributionControl,
  setWorkerUrl: mapMocks.setWorkerUrl,
}));

function emit(event: string) {
  for (const handler of mapMocks.handlers.get(event) ?? []) handler();
}

afterEach(() => {
  mapMocks.handlers.clear();
  vi.clearAllMocks();
});

describe("portfolio-kaart", () => {
  it("laadt de kaart en selecteert exacte en globale locaties", async () => {
    const user = userEvent.setup();
    render(<PortfolioMap points={pointsOfInterest} projects={projects} />);

    expect(screen.getByText("Kaart wordt geladen…")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Interactieve wereldkaart" })).toBeInTheDocument();

    act(() => emit("styledata"));
    expect(mapMocks.map.setProjection).toHaveBeenCalledWith({ type: "globe" });
    expect(screen.queryByText("Kaart wordt geladen…")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Techniek College Rotterdam/i }));
    expect(mapMocks.map.setMaxZoom).toHaveBeenLastCalledWith(19);
    expect(mapMocks.map.jumpTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ center: [4.3832053, 51.9239476], zoom: 16.5 }),
    );
    expect(screen.getAllByText("Schiedamseweg 245, 3118 JB Schiedam")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: /^Urbexium/i }));
    expect(mapMocks.map.setMaxZoom).toHaveBeenLastCalledWith(9);
    expect(mapMocks.map.jumpTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ center: [6.7735, 51.2277], zoom: 7.5 }),
    );
    expect(screen.getByText("Gehost op een VPS")).toBeInTheDocument();
  });

  it("herstelt het wereldbeeld en ruimt de kaart op", async () => {
    const user = userEvent.setup();
    const view = render(<PortfolioMap points={pointsOfInterest} projects={projects} />);
    act(() => emit("styledata"));

    await user.click(screen.getByRole("button", { name: "Wereldbeeld" }));
    expect(mapMocks.map.setMaxZoom).toHaveBeenLastCalledWith(19);
    expect(mapMocks.map.jumpTo).toHaveBeenCalledWith(
      expect.objectContaining({ center: [7, 43], pitch: 0 }),
    );

    const cleanupCalls = mapMocks.map.remove.mock.calls.length;
    view.unmount();
    expect(mapMocks.map.remove).toHaveBeenCalledTimes(cleanupCalls + 1);
  });
});
