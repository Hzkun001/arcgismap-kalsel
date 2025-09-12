import { useEffect, useRef } from "react";
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";

type ArcMapProps = {
  basemap?: string;
  center: [number, number]; // [lng, lat]
  zoom?: number;
  className?: string;
  onReady?: (ctx: { map: Map; view: MapView }) => void; // callback saat siap
};

export default function ArcMap({
  basemap = "osm",
  center,
  zoom = 15,
  className = "viewDiv",
  onReady,
}: ArcMapProps) {
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!divRef.current) return;

    const map = new Map({ basemap });
    const view = new MapView({
      map,
      container: divRef.current,
      center,
      zoom,
    });

    // Beri tahu parent kalau sudah siap
    onReady?.({ map, view });

    // Cleanup
    return () => view?.destroy();
  }, [basemap, center[0], center[1], zoom]); // dependensi primitif biar stabil

  return <div className={className} ref={divRef} />;
}
