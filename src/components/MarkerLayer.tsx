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
  color?: string | number[];
};

type MarkerLayerProps = {
  map: Map | null;
  markers: MarkerItem[];
  autoFit?: boolean;
  view?: __esri.MapView;
  suppressAutoGoToRef?: React.MutableRefObject<boolean>; // guard
};

export default function MarkerLayer({
  map,
  markers,
  autoFit = true,
  view,
  suppressAutoGoToRef,
}: MarkerLayerProps) {
  const layerRef = useRef<GraphicsLayer | null>(null);

  useEffect(() => {
    if (!map) return;
    const layer = new GraphicsLayer();
    map.add(layer);
    layerRef.current = layer;

    return () => {
      map.remove(layer);
      layer.destroy();
      layerRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    layer.removeAll();

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
        popupTemplate:
          m.title || m.description
            ? { title: "{name}", content: "{description}" }
            : undefined,
      });
    });

    layer.addMany(graphics);

    // auto-fit hanya kalau tidak sedang suppress
    if (
      autoFit &&
      view &&
      graphics.length > 0 &&
      !suppressAutoGoToRef?.current
    ) {
      view.goTo(graphics).catch(() => {});
    }
  }, [markers, view, autoFit, suppressAutoGoToRef]);

  return null;
}
