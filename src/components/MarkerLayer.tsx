import { useEffect, useRef } from "react";
import Map from "@arcgis/core/Map";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";

export type MarkerItem = {
  id?: string | number;
  lng: number;
  lat: number;
  title?: string;
  description?: string;
  color?: string | number[]; // fleksibel
};

type MarkerLayerProps = {
  map: Map | null;
  markers: MarkerItem[];
  autoFit?: boolean; // fit kamera ke semua marker
  view?: __esri.MapView; // kalau mau autoFit perlu view
};

export default function MarkerLayer({ map, markers, autoFit = true, view }: MarkerLayerProps) {
  const layerRef = useRef<GraphicsLayer | null>(null);

  useEffect(() => {
    if (!map) return;

    // Buat layer sekali
    const layer = new GraphicsLayer();
    map.add(layer);
    layerRef.current = layer;

    return () => {
      // Hapus layer ketika komponen unmount / map ganti
      map.remove(layer);
      layer.destroy();
      layerRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    // Bersihkan marker lama
    layer.removeAll();

    // Tambah marker baru
    const graphics = markers.map((m) => {
      const point = new Point({ longitude: m.lng, latitude: m.lat });
      const symbol = new SimpleMarkerSymbol({
        color: m.color ?? "red",
        size: 15,
        outline: { color: "white", width: 2 },
      });

      return new Graphic({
        geometry: point,
        symbol,
        attributes: {
          id: m.id,
          name: m.title,
          description: m.description,
        },
        popupTemplate: m.title || m.description
          ? { title: "{name}", content: "{description}" }
          : undefined,
      });
    });

    layer.addMany(graphics);

    // Auto-fit kamera ke semua marker
    if (autoFit && view && graphics.length > 0) {
      view.goTo(graphics).catch(() => {});
    }
  }, [markers, view]);

  return null; // Layer tidak merender elemen DOM
}
