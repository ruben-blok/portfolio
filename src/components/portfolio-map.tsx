"use client";

import {
  AttributionControl,
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
  circlePolygon,
  GENERAL_MAX_ZOOM,
  openStreetMapUrl,
  pointCamera,
  pointPosition,
  worldCamera,
} from "@/lib/map-camera";

type PortfolioMapProps = {
  points: PointOfInterest[];
  projects: Project[];
};

const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
const MAP_LOAD_TIMEOUT = 15_000;
const MARKER_LABEL_ZOOM = 4;

export function PortfolioMap({ points, projects }: PortfolioMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const pointsRef = useRef(points);
  const reduceMotionRef = useRef(false);
  const selectPointRef = useRef<(point: PointOfInterest) => void>(() => undefined);
  const [selectedId, setSelectedId] = useState<string>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [zoom, setZoom] = useState(1);

  const selectedPoint = points.find((point) => point.id === selectedId);
  const selectedProject = projects.find((project) => project.id === selectedPoint?.projectId);

  const selectPoint = (point: PointOfInterest) => {
    setSelectedId(point.id);
    const map = mapRef.current;
    if (!map) return;

    map.setMaxZoom(point.maxZoom);
    const camera = pointCamera(point);
    const options = { ...camera, duration: reduceMotionRef.current ? 0 : 1800 };
    if (reduceMotionRef.current) map.jumpTo(options);
    else map.flyTo(options);
  };

  selectPointRef.current = selectPoint;

  const resetMap = () => {
    setSelectedId(undefined);
    const map = mapRef.current;
    if (!map) return;

    map.setMaxZoom(GENERAL_MAX_ZOOM);
    const camera = worldCamera(window.matchMedia("(max-width: 767px)").matches);
    const options = { ...camera, duration: reduceMotionRef.current ? 0 : 1600 };
    if (reduceMotionRef.current) map.jumpTo(options);
    else map.flyTo(options);
  };

  useEffect(() => {
    if (!containerRef.current) return;

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
      });
      mapRef.current = map;
      map.addControl(new AttributionControl({ compact: false }), "bottom-right");

      timeout = window.setTimeout(() => setStatus("error"), MAP_LOAD_TIMEOUT);

      map.on("styledata", () => {
        if (didInitialize) return;
        didInitialize = true;
        window.clearTimeout(timeout);
        map.setProjection({ type: "globe" });
        setStatus("ready");
        setZoom(map.getZoom());

        const approximatePoints = pointsRef.current.filter(
          (point) => point.precision === "approximate",
        );
        map.addSource("approximate-pois", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: approximatePoints.map((point) => ({
              ...circlePolygon(point.center, point.radiusKm),
              properties: { id: point.id },
            })),
          },
        });
        map.addLayer({
          id: "approximate-poi-fill",
          type: "fill",
          source: "approximate-pois",
          paint: { "fill-color": "#1d4a3a", "fill-opacity": 0.12 },
        });
        map.addLayer({
          id: "approximate-poi-outline",
          type: "line",
          source: "approximate-pois",
          paint: {
            "line-color": "#1d4a3a",
            "line-width": 2,
            "line-dasharray": [2, 2],
          },
        });

        for (const point of pointsRef.current) {
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

        const updateMarkerLabels = () => {
          const showLabels = map.getZoom() >= MARKER_LABEL_ZOOM;
          for (const marker of markersRef.current) {
            marker.getElement().classList.toggle("map-marker-labelled", showLabels);
          }
        };

        updateMarkerLabels();
        map.on("zoom", updateMarkerLabels);
      });

      map.on("zoom", () => setZoom(map.getZoom()));

      if (typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver(() => map.resize());
        observer.observe(containerRef.current);
        resizeObserver = observer;
      }
    } catch {
      setStatus("error");
      return;
    }

    return () => {
      window.clearTimeout(timeout);
      resizeObserver?.disconnect();
      for (const marker of markersRef.current) marker.remove();
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const currentMaxZoom = selectedPoint?.maxZoom ?? GENERAL_MAX_ZOOM;

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
        {status === "loading" ? (
          <p className="map-status" role="status">
            Kaart wordt geladen…
          </p>
        ) : null}
        {status === "error" ? (
          <div className="map-status map-error" role="status">
            <p>De interactieve kaart kon niet laden. Kies hieronder een locatie.</p>
          </div>
        ) : null}
        <div className="map-readout" aria-hidden="true">
          <span>wereld / lokaal</span>
          <span>zoom {zoom.toFixed(1)}</span>
        </div>
      </div>

      <fieldset className="map-controls">
        <legend className="sr-only">Kaart bedienen</legend>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut({ duration: reduceMotionRef.current ? 0 : 250 })}
          disabled={status !== "ready" || zoom <= 0}
        >
          Uitzoomen
        </button>
        <output aria-live="polite" aria-label="Zoomniveau">
          {zoom.toFixed(1)}
        </output>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn({ duration: reduceMotionRef.current ? 0 : 250 })}
          disabled={status !== "ready" || zoom >= currentMaxZoom}
        >
          Inzoomen
        </button>
        <button type="button" onClick={resetMap} disabled={status !== "ready"}>
          Wereldbeeld
        </button>
      </fieldset>

      <fieldset className="map-poi-list">
        <legend className="sr-only">Locaties op de kaart</legend>
        {points.map((point) => (
          <button
            key={point.id}
            type="button"
            aria-pressed={selectedId === point.id}
            onClick={() => selectPoint(point)}
          >
            <span>{point.label}</span>
            <span>{point.precision === "exact" ? point.address : point.location}</span>
          </button>
        ))}
      </fieldset>

      {selectedPoint ? (
        <PoiDetail point={selectedPoint} project={selectedProject} />
      ) : (
        <p className="map-prompt">Kies een locatie om van wereldschaal naar detail te gaan.</p>
      )}

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
