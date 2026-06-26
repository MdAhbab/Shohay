import { useEffect, useRef } from "react";
import maplibregl, { type ExpressionSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { divisions, type Unit } from "../../lib/data";

export type Layer = "need" | "fulfillment" | "received";

const GEOJSON_URL = "/geo/bd-divisions.geojson";
// Bangladesh bounding box — keeps the delta framed without a basemap.
const BOUNDS: [number, number, number, number] = [88.0, 20.5, 92.7, 26.7];

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lerp(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const mix = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${mix(r1, r2)}, ${mix(g1, g2)}, ${mix(b1, b2)})`;
}

function colorForUnit(u: Unit, layer: Layer): string {
  if (layer === "fulfillment") {
    const f = u.fulfillment;
    if (f >= 75) return cssVar("--ok");
    if (f >= 50) return cssVar("--river-2");
    if (f >= 30) return cssVar("--warn");
    return cssVar("--terracotta");
  }
  if (layer === "received") {
    const r = Math.min(1, u.received / 1840);
    return lerp(cssVar("--need-0"), cssVar("--river"), 0.2 + r * 0.7);
  }
  const idx = Math.min(4, Math.max(0, u.need - 1));
  return cssVar(`--need-${idx}`);
}

/** Per-division fill colour as a data-driven match on the `geocode` property. */
function fillExpression(layer: Layer): ExpressionSpecification {
  const cases: (string | string[])[] = [];
  for (const u of divisions) cases.push(u.geocode, colorForUnit(u, layer));
  return ["match", ["get", "geocode"], ...cases, cssVar("--need-0")] as unknown as ExpressionSpecification;
}

export default function MapLibreCoverage({
  layer,
  selected,
  onSelect,
}: {
  layer: Layer;
  selected?: Unit | null;
  onSelect?: (u: Unit) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const loadedRef = useRef(false);
  // Keep the latest onSelect without re-binding the map click handler.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Init once.
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [{ id: "bg", type: "background", paint: { "background-color": cssVar("--panel") } }],
      },
      bounds: BOUNDS,
      fitBoundsOptions: { padding: 24 },
      attributionControl: false,
      dragRotate: false,
      scrollZoom: false, // never hijack page scroll
      maxBounds: [BOUNDS[0] - 2, BOUNDS[1] - 2, BOUNDS[2] + 2, BOUNDS[3] + 2],
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: "shohay-map-popup" });

    map.on("load", () => {
      map.addSource("divisions", { type: "geojson", data: GEOJSON_URL, promoteId: "geocode" });
      map.addLayer({ id: "div-fill", type: "fill", source: "divisions", paint: { "fill-color": fillExpression(layer), "fill-opacity": 0.82 } });
      map.addLayer({ id: "div-line", type: "line", source: "divisions", paint: { "line-color": cssVar("--bg-elev"), "line-width": 0.8 } });
      map.addLayer({ id: "div-sel", type: "line", source: "divisions", paint: { "line-color": cssVar("--gold"), "line-width": 2.4 }, filter: ["==", ["get", "geocode"], selected?.geocode ?? "__none__"] });
      loadedRef.current = true;

      const byGeo = new Map(divisions.map((u) => [u.geocode, u]));
      map.on("click", "div-fill", (e) => {
        const gc = e.features?.[0]?.properties?.geocode as string | undefined;
        const u = gc ? byGeo.get(gc) : undefined;
        if (u) onSelectRef.current?.(u);
      });
      map.on("mousemove", "div-fill", (e) => {
        map.getCanvas().style.cursor = "pointer";
        const f = e.features?.[0];
        const gc = f?.properties?.geocode as string | undefined;
        const u = gc ? byGeo.get(gc) : undefined;
        if (u) {
          popup
            .setLngLat(e.lngLat)
            .setHTML(`<strong>${u.name_en}</strong><br/>Fulfillment ${u.fulfillment}% · ${u.beneficiaries.toLocaleString("en-IN")}`)
            .addTo(map);
        }
      });
      map.on("mouseleave", "div-fill", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
  }, []);

  // React to layer / theme changes (theme swaps the resolved CSS vars).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    map.setPaintProperty("div-fill", "fill-color", fillExpression(layer));
    map.setPaintProperty("div-line", "line-color", cssVar("--bg-elev"));
    map.setPaintProperty("div-sel", "line-color", cssVar("--gold"));
    map.setPaintProperty("bg", "background-color", cssVar("--panel"));
  });

  // React to selection.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    map.setFilter("div-sel", ["==", ["get", "geocode"], selected?.geocode ?? "__none__"]);
  }, [selected]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
