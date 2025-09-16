// src/components/ArcMap.tsx
import { useEffect, useRef } from "react";
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";

type ArcMapProps = {
  basemap?: string;
  center?: [number, number]; // opsional
  zoom?: number;             // opsional
  className?: string;
  onReady?: (ctx: { map: Map; view: MapView }) => void;
};

export default function ArcMap({
  basemap = "osm",
  center,
  zoom,
  className = "viewDiv",
  onReady,
}: ArcMapProps) {
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!divRef.current) return;

    const map = new Map({ basemap });

    // ⬅️ SET center/zoom LANGSUNG di constructor, bukan di view.when
    const view = new MapView({
      map,
      container: divRef.current,
      center, // hanya dipakai sekali di awal
      zoom,   // hanya dipakai sekali di awal
      ui: { components: ["attribution", "zoom"] },
      constraints: { snapToZoom: false },
    });

    onReady?.({ map, view });

    // ResizeObserver cukup paksa layout ulang, tidak goTo
    const ro = new ResizeObserver(() => {
      try {
        (view as any).resize?.();
      } catch {
        /* abaikan jika TS tidak kenal */
      }
    });
    ro.observe(divRef.current);

    return () => {
      ro.disconnect();
      view.destroy();
    };
  }, [basemap]); // ⚠️ center/zoom sengaja tidak dimasukkan di deps

  return <div ref={divRef} className={className} />;
}
