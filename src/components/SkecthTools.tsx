import { useEffect, useRef, useState } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Sketch from "@arcgis/core/widgets/Sketch";

type Props = {
  map: Map | null;
  view: MapView | null;
  // posisi tombol & panel relatif ke peta: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

export default function CollapsibleSketch({ map, view, corner = "top-right" }: Props) {
  const [open, setOpen] = useState(false);           // state show/hide panel
  const layerRef = useRef<GraphicsLayer | null>(null);
  const sketchRef = useRef<Sketch | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // siapkan GraphicsLayer sekali
  useEffect(() => {
    if (!map) return;
    const layer = new GraphicsLayer({ title: "Sketch Layer" });
    map.add(layer);
    layerRef.current = layer;

    return () => {
      map.remove(layer);
      layer.destroy();
      layerRef.current = null;
    };
  }, [map]);

  // inisialisasi Sketch saat view & panel siap
  useEffect(() => {
    if (!view || !panelRef.current || !layerRef.current) return;

    // Bikin Sketch dengan container ke panelRef (bukan view.ui.add)
    const sketch = new Sketch({
      view,
      layer: layerRef.current,
      container: panelRef.current, // <<— ini kunci untuk bisa di-toggle via CSS
      visibleElements: {
        createTools: { point: true, polyline: true, polygon: true, rectangle: true, circle: true },
        selectionTools: { "lasso-selection": true, "rectangle-selection": true },
        settingsMenu: true,
        undoRedoMenu: true,
      },
      creationMode: "update",
    });
    sketchRef.current = sketch;

    return () => {
      sketch.destroy();
      sketchRef.current = null;
    };
  }, [view]);

  // kelas posisi untuk tombol/panel
  const cornerClass =
    corner === "top-left" ? "top-3 left-3" :
    corner === "top-right" ? "top-3 right-3" :
    corner === "bottom-left" ? "bottom-3 left-3" :
    "bottom-3 right-3";

  return (
    <>

      {/* Panel container Sketch (muncul saat open=true) */}
      <div
        ref={panelRef}
        className={`sketch-panel ${cornerClass} ${open ? "block" : "hidden"}`}
        // biar klik di panel nggak nge-drag peta
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      />
    </>
  );
}
