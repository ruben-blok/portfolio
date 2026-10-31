import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PortfolioMap } from "@/components/portfolio-map";
import { getContent } from "@/content";
import { GENERAL_MAX_ZOOM, worldCamera } from "@/lib/map-camera";

const mapMocks = vi.hoisted(() => {
  const handlers = new Map<string, Array<(event?: { error?: Error }) => void>>();
  const state: { container: HTMLElement | null } = { container: null };
  const map = {
    setProjection: vi.fn(),
    addControl: vi.fn(),
    on: vi.fn((event: string, first?: unknown, second?: unknown) => {
      // MapLibre also takes `on(type, layerId, listener)` for layer-scoped events, so
      // store those under "type:layerId" and keep both-argument calls as they were.
      const handler = typeof first === "function" ? first : second;
      if (typeof handler !== "function") return;
      const key = typeof first === "string" ? `${event}:${first}` : event;
      handlers.set(key, [
        ...(handlers.get(key) ?? []),
        handler as (event?: { error?: Error }) => void,
      ]);
    }),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    getLayer: vi.fn((id: string) => (id.startsWith("label_") ? { id } : undefined)),
    setLayoutProperty: vi.fn(),
    getStyle: vi.fn(() => ({
      layers: [
        { id: "water", type: "fill" },
        { id: "label_city", type: "symbol" },
      ],
    })),
    setPaintProperty: vi.fn(),
    queryRenderedFeatures: vi.fn(() => []),
    project: vi.fn((position: [number, number]) => ({
      x: 40 + position[0] * 4,
      y: 20 + position[1] * 4,
    })),
    getCanvas: vi.fn(() => document.createElement("canvas")),
    getZoom: vi.fn(() => 1.35),
    getCenter: vi.fn(() => ({ lng: 7, lat: 43 })),
    isMoving: vi.fn(() => false),
    setPadding: vi.fn(),
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
    state,
    Map: vi.fn((options?: { container?: HTMLElement }) => {
      state.container = options?.container ?? null;
      return map;
    }),
    Marker: vi.fn((options?: { element?: HTMLElement }) => {
      const element = options?.element ?? document.createElement("button");
      state.container?.appendChild(element);
      return {
        setLngLat: vi.fn().mockReturnThis(),
        addTo: vi.fn().mockReturnThis(),
        getElement: vi.fn(() => element),
        remove: vi.fn(),
      };
    }),
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

const nlContent = getContent("nl");
const enContent = getContent("en");

function emit(event: string) {
  for (const handler of mapMocks.handlers.get(event) ?? []) handler();
}

/** Fires a listener registered for one map layer, e.g. the boundary outline. */
function emitLayer(event: string, layerId: string) {
  for (const handler of mapMocks.handlers.get(`${event}:${layerId}`) ?? []) handler();
}

afterEach(() => {
  mapMocks.handlers.clear();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("portfolio-kaart", () => {
  it("laadt de kaart en selecteert exacte en globale locaties", async () => {
    const user = userEvent.setup();
    render(<PortfolioMap content={nlContent} />);

    expect(screen.getByText("Kaart wordt geladen…")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Interactieve wereldkaart" })).toBeInTheDocument();

    act(() => emit("styledata"));
    expect(mapMocks.map.setProjection).toHaveBeenCalledWith({ type: "globe" });
    expect(screen.queryByText("Kaart wordt geladen…")).not.toBeInTheDocument();
    expect(document.querySelector("canvas.map-ascii")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Techniek College Rotterdam" }));
    expect(mapMocks.map.setMaxZoom).toHaveBeenLastCalledWith(19);
    expect(mapMocks.map.jumpTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ center: [4.3832053, 51.9239476], zoom: 16.5 }),
    );
    expect(screen.getAllByText("Schiedamseweg 245, 3118 JB Schiedam")).toHaveLength(1);
    expect(screen.queryByRole("link", { name: /naar project/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Urbexium" }));
    expect(mapMocks.map.setMaxZoom).toHaveBeenLastCalledWith(9);
    expect(mapMocks.map.jumpTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ center: [6.7735, 51.2277], zoom: 7.5 }),
    );
    expect(screen.getByText("Gehost op een VPS")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /naar project/i })).toHaveAttribute(
      "href",
      "#project-urbexium",
    );
  });

  it("toont de Engelse kaartteksten en details", async () => {
    const user = userEvent.setup();
    render(<PortfolioMap content={enContent} />);

    expect(screen.getByText("Loading map…")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Interactive world map" })).toBeInTheDocument();
    expect(document.querySelector(".map-mobile-tip")).toHaveTextContent(
      "The map is easiest to use on a larger screen.",
    );
    expect(screen.getByText("Choose a location to zoom in.")).toBeInTheDocument();

    act(() => emit("styledata"));

    await user.click(screen.getByRole("button", { name: "Urbexium" }));
    expect(screen.getByText("Hosted on a VPS")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to project/i })).toHaveAttribute(
      "href",
      "#project-urbexium",
    );
  });

  it("centreert de globe met de camera op de kaartkolom", () => {
    const offsetHeightSpy = vi
      .spyOn(HTMLElement.prototype, "offsetHeight", "get")
      .mockReturnValue(180);
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("hero-map-anchor")) {
          return { left: 459, width: 757 } as DOMRect;
        }
        if (this.classList.contains("map-canvas")) {
          return { left: 0, width: 1280 } as DOMRect;
        }
        return { left: 0, width: 0 } as DOMRect;
      });
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: !query.includes("max-width") && !query.includes("reduce"),
        media: query,
      })),
    );

    const { container } = render(
      <div className="hero-grid">
        <div className="hero-copy" />
        <div className="hero-map-anchor" />
        <div className="hero-map">
          <PortfolioMap content={nlContent} />
        </div>
      </div>,
    );
    expect(container.querySelector(".hero-grid")).not.toBeNull();
    act(() => emit("styledata"));

    // Column centre = 459 - 0 + 757/2 = 837.5, so padding L = 2 * 837.5 - 1280 = 395.
    expect(mapMocks.map.setPadding).toHaveBeenCalledWith({
      top: 0,
      right: 0,
      bottom: 180,
      left: 395,
    });

    offsetHeightSpy.mockRestore();
    rectSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it("toont geen zoomknoppen of zoomcijfers meer", () => {
    render(<PortfolioMap content={nlContent} />);
    act(() => emit("styledata"));

    expect(screen.queryByRole("button", { name: /zoomen/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Wereldbeeld" })).not.toBeInTheDocument();
    expect(screen.queryByText(/wereld \/ lokaal/i)).not.toBeInTheDocument();
    expect(document.querySelector(".map-readout")).not.toBeInTheDocument();
    expect(document.querySelector(".map-controls")).not.toBeInTheDocument();
  });

  it("leest de namen uit de basiskaart en tekent ze als echte tekst", async () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(640);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(480);
    mapMocks.map.getZoom.mockReturnValue(5);
    mapMocks.map.queryRenderedFeatures.mockReturnValue([
      {
        layer: { id: "label_city" },
        properties: { name: "Rotterdam" },
        geometry: { type: "Point", coordinates: [4.48, 51.92] },
      },
    ] as never);

    render(<PortfolioMap content={nlContent} />);
    act(() => emit("styledata"));

    // The symbol layers stay visible and are silenced by paint opacity instead, so the
    // query keeps reporting their geometry.
    expect(mapMocks.map.setLayoutProperty).not.toHaveBeenCalled();

    await act(async () => {
      emit("render");
      await new Promise((resolve) => window.requestAnimationFrame(() => resolve(undefined)));
    });

    expect(mapMocks.map.queryRenderedFeatures).toHaveBeenCalledWith({
      layers: expect.arrayContaining(["label_city"]),
    });

    const labels = document.querySelectorAll(".map-label");
    expect(labels).toHaveLength(1);
    expect(labels[0].textContent).toBe("Rotterdam");

    mapMocks.map.getZoom.mockReturnValue(1.35);
  });

  it("gebruikt de Engelse plaatsnamen op de Engelse pagina", async () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(640);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(480);
    mapMocks.map.getZoom.mockReturnValue(5);
    mapMocks.map.queryRenderedFeatures.mockReturnValue([
      {
        layer: { id: "label_country_1" },
        properties: { name: "Deutschland", "name:nl": "Duitsland", "name:en": "Germany" },
        geometry: { type: "Point", coordinates: [4.48, 51.92] },
      },
    ] as never);

    render(<PortfolioMap content={enContent} />);
    act(() => emit("styledata"));

    await act(async () => {
      emit("render");
      await new Promise((resolve) => window.requestAnimationFrame(() => resolve(undefined)));
    });

    expect(document.querySelector(".map-label")?.textContent).toBe("Germany");

    mapMocks.map.getZoom.mockReturnValue(1.35);
    mapMocks.map.queryRenderedFeatures.mockReturnValue([]);
  });

  it("toont de tip voor een groot scherm in het kaartveld", () => {
    render(<PortfolioMap content={nlContent} />);

    expect(document.querySelector(".map-mobile-tip")).toHaveTextContent(
      "De kaart is het prettigst op een groot scherm.",
    );
  });

  it("laat het wereldbeeld zonder basiskaartlabels", async () => {
    mapMocks.map.getZoom.mockReturnValue(1.35);

    render(<PortfolioMap content={nlContent} />);
    act(() => emit("styledata"));

    await act(async () => {
      emit("render");
      await new Promise((resolve) => window.requestAnimationFrame(() => resolve(undefined)));
    });

    expect(mapMocks.map.queryRenderedFeatures).not.toHaveBeenCalled();
    expect(document.querySelectorAll(".map-label")).toHaveLength(0);
  });

  it("dempt de tekst en iconen van symboollagen zonder ze te verbergen", () => {
    render(<PortfolioMap content={nlContent} />);
    act(() => emit("styledata"));

    expect(mapMocks.map.setPaintProperty).toHaveBeenCalledWith("label_city", "text-opacity", 0);
    expect(mapMocks.map.setPaintProperty).toHaveBeenCalledWith("label_city", "icon-opacity", 0);

    for (const call of mapMocks.map.setPaintProperty.mock.calls) {
      expect(call[0]).not.toBe("water");
    }
    expect(mapMocks.map.setLayoutProperty).not.toHaveBeenCalled();
  });

  it("biedt een knop om terug te gaan naar het wereldbeeld", async () => {
    const user = userEvent.setup();
    render(<PortfolioMap content={nlContent} />);
    act(() => emit("styledata"));

    // The camera starts on the world globe, so there is nothing to return to yet.
    expect(screen.queryByRole("button", { name: /terug naar de wereldkaart/i })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Urbexium" }));
    expect(screen.getByRole("button", { name: /terug naar de wereldkaart/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /terug naar de wereldkaart/i }));

    // The POI had lowered the zoom limit to its own detail level, so it is restored too.
    expect(mapMocks.map.setMaxZoom).toHaveBeenLastCalledWith(GENERAL_MAX_ZOOM);
    expect(mapMocks.map.jumpTo).toHaveBeenLastCalledWith(
      expect.objectContaining({
        center: [7, 43],
        zoom: worldCamera(true).zoom,
        bearing: 0,
        pitch: 0,
      }),
    );
    expect(screen.queryByRole("button", { name: /terug naar de wereldkaart/i })).toBeNull();
    expect(screen.queryByText("Gehost op een VPS")).not.toBeInTheDocument();
  });

  it("snapt na de reset naar de wereldcamera zodat de knop niet terugkomt", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("max-width: 767px"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

    render(<PortfolioMap content={nlContent} />);
    act(() => emit("styledata"));

    await user.click(screen.getByRole("button", { name: "Urbexium" }));
    expect(mapMocks.map.flyTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ duration: 2600 }),
    );

    await user.click(screen.getByRole("button", { name: /terug naar de wereldkaart/i }));
    expect(mapMocks.map.flyTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ duration: 2200 }),
    );

    // The reset flight has ended: it snaps to the exact world camera and settles there.
    act(() => emit("moveend"));

    expect(mapMocks.map.jumpTo).toHaveBeenLastCalledWith(
      expect.objectContaining({
        center: [7, 43],
        zoom: worldCamera(true).zoom,
        bearing: 0,
        pitch: 0,
      }),
    );
    expect(screen.queryByRole("button", { name: /terug naar de wereldkaart/i })).toBeNull();
    expect(screen.getByText("Kies een locatie om in te zoomen.")).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("toont de knop zodra de camera van het wereldbeeld afwijkt", () => {
    render(<PortfolioMap content={nlContent} />);
    act(() => emit("styledata"));

    mapMocks.map.getZoom.mockReturnValue(worldCamera(true).zoom);
    act(() => emit("moveend"));
    expect(screen.queryByRole("button", { name: /terug naar de wereldkaart/i })).toBeNull();

    mapMocks.map.getZoom.mockReturnValue(5);
    act(() => emit("moveend"));
    expect(screen.getByRole("button", { name: /terug naar de wereldkaart/i })).toBeInTheDocument();

    mapMocks.map.getZoom.mockReturnValue(1.35);
  });

  it("trekt de gemeentegrens als outline en selecteert hem via de kaartlaag", () => {
    render(<PortfolioMap content={nlContent} />);
    act(() => emit("styledata"));

    const sources = mapMocks.map.addSource.mock.calls.map((call: unknown[]) => call[0]);
    const layers = mapMocks.map.addLayer.mock.calls.map(
      (call: unknown[]) => call[0] as { id?: string; type?: string; source?: string },
    );
    const outline = layers.find((layer) => layer.id === "poi-boundary-westland-outline");

    expect(sources).toContain("poi-boundary-westland");
    expect(outline?.type).toBe("line");
    expect(outline?.source).toBe("poi-boundary-westland");
    // Een vlak krijgt geen marker en geen cirkel: de outline is de vorm.
    expect(document.querySelector(".map-marker-boundary")).toBeNull();
    expect(document.querySelectorAll(".map-poi-circle")).toHaveLength(
      nlContent.pointsOfInterest.filter((point) => point.precision === "approximate").length,
    );

    act(() => emitLayer("click", "poi-boundary-westland-outline"));
    expect(screen.getByText("Hier woon ik")).toBeInTheDocument();
  });

  it("tekent de globale cirkels als overlay die met de zoom meeschalen", () => {
    render(<PortfolioMap content={nlContent} />);
    act(() => emit("styledata"));

    const circles = document.querySelectorAll(".map-poi-circle");
    expect(circles).toHaveLength(
      nlContent.pointsOfInterest.filter((point) => point.precision === "approximate").length,
    );

    const exact = document.querySelector(".map-marker-exact");
    expect(exact).not.toBeNull();
    expect(exact).not.toHaveClass("map-poi-circle");
    expect(circles[0]).not.toBe(exact);

    const circle = circles[0] as HTMLElement;

    mapMocks.map.getZoom.mockReturnValue(7.5);
    act(() => emit("zoom"));
    const near = Number.parseFloat(circle.style.width);

    mapMocks.map.getZoom.mockReturnValue(8.5);
    act(() => emit("zoom"));
    const closer = Number.parseFloat(circle.style.width);

    expect(near).toBeGreaterThan(0);
    expect(closer).toBeCloseTo(near * 2, 6);

    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(640);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(480);

    mapMocks.map.getZoom.mockReturnValue(12);
    act(() => emit("zoom"));
    expect(circle.style.display).toBe("none");

    mapMocks.map.getZoom.mockReturnValue(7.5);
    act(() => emit("zoom"));
    expect(circle.style.display).not.toBe("none");

    mapMocks.map.getZoom.mockReturnValue(1.35);
    vi.restoreAllMocks();
  });
});
