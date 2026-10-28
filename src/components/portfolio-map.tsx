"use client";

import {
  type ExpressionSpecification,
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  type Marker,
  setWorkerUrl,
} from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { PoiDetail } from "@/components/poi-detail";
import type { PointOfInterest } from "@/data/points-of-interest";
import type { Project } from "@/data/projects";
import {
  type AsciiSample,
  asciiSample,
  asciiSurface,
  drawAsciiArt,
  toAsciiArt,
  toneForZoom,
} from "@/lib/ascii-map";
import {
  circleRadiusPixels,
  GENERAL_MAX_ZOOM,
  openStreetMapUrl,
  pointCamera,
  pointPosition,
  worldCamera,
} from "@/lib/map-camera";
import {
  LABELLED_LAYERS,
  type LabelFeature,
  labelMetrics,
  type MapLabel,
  measureText,
  toLabels,
} from "@/lib/map-labels";

type PortfolioMapProps = {
  points: PointOfInterest[];
  projects: Project[];
};

const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
const MAP_LOAD_TIMEOUT = 15_000;
const MARKER_LABEL_ZOOM = 4;
const LABEL_MIN_ZOOM = 4;
const POI_FLY_DURATION = 2600;
const RESET_FLY_DURATION = 2200;
const ASCII_INK = "#14332a";
const ASCII_PAPER = "#e8e8df";
const MAX_LABELS = 16;
/**
 * Positron draws land and paper with the same colour, so at country scale every cell
 * reads as blank paper. Darkening the background between those zooms gives the land a
 * light stipple while leaving the world globe and the street-level paper untouched.
 */
const LAND_TINT: ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  0,
  "rgb(242, 243, 240)",
  5,
  "rgb(242, 243, 240)",
  7,
  "rgb(221, 223, 218)",
  11,
  "rgb(221, 223, 218)",
  13,
  "rgb(242, 243, 240)",
  22,
  "rgb(242, 243, 240)",
];

/**
 * Copies the WebGL frame into a small scratch buffer and returns its pixels. Reading
 * goes through a 2D context because `getImageData` is not available on a WebGL canvas,
 * and downscaling in the same step keeps the readback cheap enough for every frame.
 */
function readFrame(source: HTMLCanvasElement, sample: AsciiSample) {
  const scratch = document.createElement("canvas");
  scratch.width = sample.width;
  scratch.height = sample.height;
  const context = scratch.getContext("2d", { willReadFrequently: true });
  if (!context) return new Uint8ClampedArray(sample.width * sample.height * 4);

  context.drawImage(source, 0, 0, sample.width, sample.height);
  return context.getImageData(0, 0, sample.width, sample.height).data;
}

/**
 * Silences the basemap's own text and icons: the glyphs are drawn into the frame the
 * ASCII pass samples, where they collapse into dense "@" runs. Paint only — the layers
 * stay visible so `queryRenderedFeatures` keeps reporting the geometry `refreshLabels`
 * needs; hiding them would also drop their tiles and their query results. The transition
 * is zeroed so no ink fades through on the first frames.
 */
function tintBasemapSurface(map: MapLibreMap) {
  if (!map.getLayer("background")) return;
  map.setPaintProperty("background", "background-color", LAND_TINT);
}

function silenceBasemapSymbols(map: MapLibreMap) {
  // Transition names are valid at runtime but absent from the paint property type.
  const setPaint = map.setPaintProperty.bind(map) as (
    layerId: string,
    name: string,
    value: unknown,
  ) => void;

  for (const layer of map.getStyle().layers) {
    if (layer.type !== "symbol") continue;
    for (const property of ["text-opacity", "icon-opacity"]) {
      setPaint(layer.id, `${property}-transition`, { duration: 0, delay: 0 });
      setPaint(layer.id, property, 0);
    }
  }
}

export function PortfolioMap({ points, projects }: PortfolioMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const approximateCirclesRef = useRef<
    { element: HTMLElement; radiusKm: number; latitude: number }[]
  >([]);
  const pointsRef = useRef(points);
  const reduceMotionRef = useRef(false);
  const selectPointRef = useRef<(point: PointOfInterest) => void>(() => undefined);
  const asciiCanvasRef = useRef<HTMLCanvasElement>(null);
  const measureContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const labelsFrameRef = useRef<number | undefined>(undefined);
  const pendingLabelsRef = useRef(false);
  const labelsDirtyRef = useRef(true);
  const resettingRef = useRef(false);
  const [labels, setLabels] = useState<MapLabel[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [atWorldView, setAtWorldView] = useState(true);
  const [hasMoved, setHasMoved] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const selectedPoint = points.find((point) => point.id === selectedId);
  const selectedProject = projects.find((project) => project.id === selectedPoint?.projectId);

  const selectPoint = (point: PointOfInterest) => {
    setSelectedId(point.id);
    setAtWorldView(false);
    setHasMoved(true);
    resettingRef.current = false;
    const map = mapRef.current;
    if (!map) return;

    map.setMaxZoom(point.maxZoom);
    const camera = pointCamera(point);
    const options = { ...camera, duration: reduceMotionRef.current ? 0 : POI_FLY_DURATION };
    if (reduceMotionRef.current) map.jumpTo(options);
    else map.flyTo(options);
  };

  /**
   * Returns the camera to the default world globe. Selecting a location lowers the
   * maximum zoom to that location's detail level, so the reset restores the general
   * limit as well as the camera.
   */
  const resetView = () => {
    setSelectedId(undefined);
    setAtWorldView(true);
    setHasMoved(false);
    const map = mapRef.current;
    if (!map) return;

    map.setMaxZoom(GENERAL_MAX_ZOOM);
    const compact = window.matchMedia("(max-width: 767px)").matches;
    const options = {
      ...worldCamera(compact),
      duration: reduceMotionRef.current ? 0 : RESET_FLY_DURATION,
    };
    if (reduceMotionRef.current) {
      resettingRef.current = false;
      map.jumpTo(options);
      return;
    }
    // The world flight can settle a fraction off target on a globe projection. Snap
    // exactly to the world camera when it ends so the reset never needs a second click.
    resettingRef.current = true;
    map.flyTo(options);
  };

  selectPointRef.current = selectPoint;

  useEffect(() => {
    if (!containerRef.current) return;

    /**
     * Repaints the ASCII layer from the freshly rendered WebGL frame. MapLibre fires
     * `render` synchronously after drawing, so the framebuffer is still readable here,
     * which is why the context is created with a preserved drawing buffer.
     */
    const drawAsciiLayer = (map: MapLibreMap) => {
      const canvas = asciiCanvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const cssWidth = container.clientWidth;
      const cssHeight = container.clientHeight;
      if (!cssWidth || !cssHeight) return;

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const surface = asciiSurface(cssWidth, cssHeight, ratio, {
        color: ASCII_INK,
        background: ASCII_PAPER,
      });

      if (canvas.width !== surface.width || canvas.height !== surface.height) {
        canvas.width = surface.width;
        canvas.height = surface.height;
      }

      const context = canvas.getContext("2d");
      if (!context) return;

      const sample = asciiSample(surface);
      const art = toAsciiArt(
        readFrame(map.getCanvas(), sample),
        sample,
        surface.columns,
        surface.rows,
        toneForZoom(map.getZoom()),
      );

      drawAsciiArt(context, art, surface);

      /*
       * Keeps the painted sheet only where the frame carries map paint, so the space
       * around the globe stays transparent and the hero copy behind it reads through.
       * The paper is otherwise opaque, which is what hides the copy as the globe grows.
       */
      context.globalCompositeOperation = "destination-in";
      context.drawImage(map.getCanvas(), 0, 0, surface.width, surface.height);
      context.globalCompositeOperation = "source-over";
    };

    /**
     * Label placement is comparatively expensive, so it runs on the frame after the
     * ASCII paint and only when the camera or the tiles actually changed.
     */
    const refreshLabels = (map: MapLibreMap) => {
      if (map.getZoom() < LABEL_MIN_ZOOM) {
        // The world view stays unlabelled: the ASCII globe is the subject, not a
        // backdrop for every country name in the basemap.
        setLabels((current) => (current.length ? [] : current));
        return;
      }

      if (pendingLabelsRef.current) return;
      pendingLabelsRef.current = true;

      labelsFrameRef.current = window.requestAnimationFrame(() => {
        pendingLabelsRef.current = false;
        labelsDirtyRef.current = false;

        const container = containerRef.current;
        const measure = measureContextRef.current;
        let features: LabelFeature[] = [];

        try {
          features = map.queryRenderedFeatures({
            layers: LABELLED_LAYERS.filter((layer) => map.getLayer(layer)),
          }) as unknown as LabelFeature[];
        } catch {
          setLabels([]);
          return;
        }

        setLabels(
          toLabels(features, (position) => map.project(position), {
            zoom: map.getZoom(),
            maxLabels: MAX_LABELS,
            width: container?.clientWidth ?? 0,
            height: container?.clientHeight ?? 0,
            metrics: measure ? labelMetrics(measure) : undefined,
            measure: measure ? (text) => measureText(measure, text) : undefined,
          }),
        );
      });
    };

    /**
     * The map canvas always covers the whole viewport width, so the globe itself is
     * positioned with the camera instead of the layout. Left padding shifts the camera
     * centre into the middle of the map anchor — right of the copy, above the legend —
     * which is where the globe belongs at world scale; zooming then grows it from that
     * spot. Below the desktop split the map is a normal band under the copy and needs no
     * padding at all.
     */
    const centerGlobeOnMapColumn = (map: MapLibreMap) => {
      const container = containerRef.current;
      const anchor = container?.closest(".hero-grid")?.querySelector(".hero-map-anchor");
      if (!container || !(anchor instanceof HTMLElement)) {
        map.setPadding({ top: 0, right: 0, bottom: 0, left: 0 });
        return;
      }
      if (window.matchMedia("(max-width: 1023px)").matches) {
        map.setPadding({ top: 0, right: 0, bottom: 0, left: 0 });
        return;
      }
      const canvasRect = container.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const anchorCentre = anchorRect.left - canvasRect.left + anchorRect.width / 2;
      const legend = container.closest(".hero-grid")?.querySelector(".map-panel");
      map.setPadding({
        top: 0,
        right: 0,
        bottom: legend instanceof HTMLElement ? legend.offsetHeight : 0,
        // With left padding L the camera centres at (L + width) / 2, so L = 2C - width.
        left: 2 * anchorCentre - canvasRect.width,
      });
    };

    /**
     * The reset button only makes sense while the camera is away from the default world
     * globe, so every settled move re-checks the camera against that starting view. The
     * tolerance keeps floating point drift in zoom and centre from flickering the button.
     */
    const syncWorldView = (map: MapLibreMap) => {
      const compact = window.matchMedia("(max-width: 767px)").matches;
      const camera = worldCamera(compact);
      const center = map.getCenter();
      const atWorld =
        Math.abs(map.getZoom() - camera.zoom) < 0.01 &&
        Math.abs(center.lng - camera.center[0]) < 0.01 &&
        Math.abs(center.lat - camera.center[1]) < 0.01;
      setAtWorldView(atWorld);
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotionRef.current = motionQuery.matches;
    const compact = window.matchMedia("(max-width: 767px)").matches;
    let map: MapLibreMap;
    let timeout = 0;
    let didInitialize = false;
    let resizeObserver: ResizeObserver | undefined;

    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      setWorkerUrl(`${basePath}/maplibre-gl-worker.mjs`);
      map = new MapLibreMap({
        container: containerRef.current,
        style: MAP_STYLE,
        ...worldCamera(compact),
        maxZoom: GENERAL_MAX_ZOOM,
        attributionControl: false,
        canvasContextAttributes: { preserveDrawingBuffer: true, antialias: false },
      });
      mapRef.current = map;
      timeout = window.setTimeout(() => setStatus("error"), MAP_LOAD_TIMEOUT);

      map.on("styledata", () => {
        if (didInitialize) return;
        didInitialize = true;
        window.clearTimeout(timeout);
        map.setProjection({ type: "globe" });
        silenceBasemapSymbols(map);
        tintBasemapSurface(map);
        setStatus("ready");
        centerGlobeOnMapColumn(map);
        syncWorldView(map);

        const measureCanvas = document.createElement("canvas");
        measureContextRef.current = measureCanvas.getContext("2d");

        for (const point of pointsRef.current) {
          if (point.precision === "approximate") {
            const circle = document.createElement("div");
            circle.className = "map-poi-circle";
            circle.setAttribute("aria-hidden", "true");
            approximateCirclesRef.current.push({
              element: circle,
              radiusKm: point.radiusKm,
              latitude: point.center[1],
            });
            markersRef.current.push(
              new MapLibreMarker({ element: circle, anchor: "center" })
                .setLngLat(pointPosition(point))
                .addTo(map),
            );
          }

          const marker = document.createElement("button");
          marker.type = "button";
          marker.className = `map-marker map-marker-${point.precision}`;
          marker.setAttribute("aria-label", `${point.label}, ${point.location}`);
          marker.innerHTML = `<span aria-hidden="true">◆</span><span>${point.label}</span>`;
          marker.addEventListener("click", () => selectPointRef.current(point));
          markersRef.current.push(
            new MapLibreMarker({ element: marker, anchor: "left" })
              .setLngLat(pointPosition(point))
              .addTo(map),
          );
        }

        /**
         * Labels appear once the view is close enough, and the approximate circles follow
         * the zoom: an area wider than the map has no boundary left to draw, so the circle
         * is dropped instead of drawn at a reduced size that would sit in the wrong place.
         */
        const updateMarkerScale = () => {
          const showLabels = map.getZoom() >= MARKER_LABEL_ZOOM;
          for (const marker of markersRef.current) {
            marker.getElement().classList.toggle("map-marker-labelled", showLabels);
          }

          const container = containerRef.current;
          const cap = container ? Math.max(container.clientWidth, container.clientHeight) : 0;
          for (const circle of approximateCirclesRef.current) {
            const diameter =
              circleRadiusPixels(circle.radiusKm, circle.latitude, map.getZoom()) * 2;
            const offScale = cap > 0 && diameter > cap;
            circle.element.style.display = offScale ? "none" : "";
            if (offScale) continue;
            circle.element.style.width = `${diameter}px`;
            circle.element.style.height = `${diameter}px`;
          }
        };

        updateMarkerScale();
        map.on("zoom", updateMarkerScale);
      });

      /**
       * The basemap's own text is rasterised into the tiles and would be mangled by the
       * ASCII conversion, so `refreshLabels` paints the names as real text on top. The
       * symbol layers themselves stay visible, because they still supply the geometry
       * that `queryRenderedFeatures` reports and the ASCII canvas covers the WebGL one.
       */
      map.on("render", () => {
        drawAsciiLayer(map);
        if (labelsDirtyRef.current) refreshLabels(map);
      });

      map.on("moveend", () => {
        if (resettingRef.current) {
          resettingRef.current = false;
          const compact = window.matchMedia("(max-width: 767px)").matches;
          // A fly-to world view can end a fraction off target; jump the last pixels so
          // the camera is exactly the default world globe.
          map.jumpTo(worldCamera(compact));
          setAtWorldView(true);
          setHasMoved(false);
          refreshLabels(map);
          return;
        }
        setHasMoved(true);
        refreshLabels(map);
        syncWorldView(map);
      });
      map.on("idle", () => refreshLabels(map));

      map.on("zoom", () => {
        labelsDirtyRef.current = true;
      });

      map.on("move", () => {
        labelsDirtyRef.current = true;
      });

      if (typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver(() => {
          map.resize();
          // Padding changes move the camera; re-centring mid-flight (a POI selection
          // opens the detail panel, which resizes the list) would cancel that flight.
          if (!map.isMoving()) centerGlobeOnMapColumn(map);
          labelsDirtyRef.current = true;
        });
        // The legend sits inside the camera's padding box, so its height (which grows
        // when a detail panel opens) moves the globe too.
        observer.observe(containerRef.current);
        const legend = containerRef.current?.closest(".hero-grid")?.querySelector(".map-panel");
        if (legend instanceof HTMLElement) observer.observe(legend);
        resizeObserver = observer;
      }
    } catch {
      setStatus("error");
      return;
    }

    return () => {
      window.clearTimeout(timeout);
      if (labelsFrameRef.current !== undefined) {
        window.cancelAnimationFrame(labelsFrameRef.current);
      }
      resizeObserver?.disconnect();
      for (const marker of markersRef.current) marker.remove();
      markersRef.current = [];
      approximateCirclesRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <section className="portfolio-map" aria-label="Interactieve wereldkaart">
      <p id="map-instructie" className="sr-only">
        Gebruik de pijltoetsen om de kaart te verplaatsen en plus of min om te zoomen.
      </p>
      <div className="map-frame">
        <div
          ref={containerRef}
          className="map-canvas"
          aria-describedby="map-instructie"
          data-status={status}
        />
        {/*
          The ASCII canvas is a decorative rendering of the same information the
          accessible map below already exposes, so it is hidden from assistive tech.
        */}
        <div className="map-ascii-layer" aria-hidden="true">
          <canvas ref={asciiCanvasRef} className="map-ascii" />
        </div>
        <div className="map-labels" aria-hidden="true">
          {labels.map((label) => (
            <span
              key={label.id}
              className="map-label"
              style={{ transform: `translate(${label.x}px, ${label.y}px)` }}
            >
              {label.text}
            </span>
          ))}
        </div>
        <p className="map-mobile-tip">Bekijk op desktop voor een betere ervaring.</p>
        {status === "loading" ? (
          <p className="map-status" role="status">
            Kaart wordt geladen…
          </p>
        ) : null}
        {status === "error" ? (
          <div className="map-status map-error" role="status">
            <p>De interactieve kaart kon niet laden. Bekijk de locaties hieronder.</p>
          </div>
        ) : null}
      </div>

      <div className="map-panel">
        <div className="map-legend">
          <p className="map-caption">Locaties</p>
          <fieldset className="map-poi-list">
            <legend className="sr-only">Locaties op de kaart</legend>
            {points.map((point) => (
              <button
                key={point.id}
                type="button"
                aria-pressed={selectedId === point.id}
                onClick={() => selectPoint(point)}
              >
                <span aria-hidden="true">◆</span>
                <span>{point.label}</span>
              </button>
            ))}
          </fieldset>
        </div>

        <div className="map-panel-detail" aria-live="polite">
          {selectedPoint ? (
            <PoiDetail point={selectedPoint} />
          ) : (
            <p className="map-prompt">Kies een locatie om in te zoomen.</p>
          )}

          {selectedProject || (status === "ready" && hasMoved && !atWorldView) ? (
            <div className="map-detail-actions">
              {selectedProject ? (
                <a href={`#project-${selectedProject.id}`}>
                  Naar project
                  <span className="sr-only"> over {selectedProject.title}</span>
                </a>
              ) : null}
              {status === "ready" && hasMoved && !atWorldView ? (
                <button type="button" className="map-reset" onClick={resetView}>
                  <span aria-hidden="true">↺</span>
                  Terug naar de wereldkaart
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {status === "error" ? (
        <div className="map-fallback-links">
          {points.map((point) => (
            <a
              key={point.id}
              href={openStreetMapUrl(point)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {point.label} bekijken op OpenStreetMap
              <span className="sr-only"> (opent in een nieuw tabblad)</span>
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}
