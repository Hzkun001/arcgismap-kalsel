import { useEffect, useRef, useState } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Sketch from "@arcgis/core/widgets/Sketch";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type Props = {
  map: Map | null;
  view: MapView | null;
  /** Posisi tombol (dan panel untuk desktop). Mobile tetap bottom-sheet. */
  corner?: Corner;
  /** Panel awal terbuka atau tidak (default: false) */
  defaultOpen?: boolean;
};

export default function CollapsibleSketch({
  map,
  view,
  corner = "top-right",
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const layerRef = useRef<GraphicsLayer | null>(null);
  const sketchRef = useRef<Sketch | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Siapkan GraphicsLayer (satu per map)
  useEffect(() => {
    if (!map) return;

    const layer = new GraphicsLayer({ title: "Sketch Layer" });
    map.add(layer);
    layerRef.current = layer;

    return () => {
      // Cleanup aman: panggil langsung, jangan cek fungsi (hindari TS2774)
      map.remove(layer);
      layer.destroy();
      layerRef.current = null;
    };
  }, [map]);

  // Inisialisasi Sketch saat view + panel + layer siap
  useEffect(() => {
    if (!view || !panelRef.current || !layerRef.current) return;

    const sketch = new Sketch({
      view,
      layer: layerRef.current,
      // Mount ke panel custom agar bisa di-toggle
      container: panelRef.current,
      // Opsi UI
      visibleElements: {
        createTools: {
          point: true,
          polyline: true,
          polygon: true,
          rectangle: true,
          circle: true,
        },
        selectionTools: { "lasso-selection": true, "rectangle-selection": true },
        settingsMenu: true,
        undoRedoMenu: true,
      },
      creationMode: "update",
    });
    sketchRef.current = sketch;

    return () => {
      // Destroy widget saat unmount / dependency berubah
      sketchRef.current?.destroy();
      sketchRef.current = null;
    };
  }, [view]);

  // Kelas util posisi (buat desktop); mobile diatur oleh CSS @media
  const cornerClass =
    corner === "top-left"
      ? "top-3 left-3"
      : corner === "top-right"
      ? "top-3 right-3"
      : corner === "bottom-left"
      ? "bottom-3 left-3"
      : "bottom-3 right-3";

  return (
    <>
      {/* Toggle button */}
      <button
        className={`sketch-toggle ${cornerClass}`}
        aria-expanded={open}
        aria-controls="sketch-panel"
        onClick={() => setOpen((v) => !v)}
        title="Sketch tools"
      >
        ✏️
      </button>

      {/* Backdrop (aktif di mobile via CSS; klik = tutup) */}
      <div
        className="sketch-backdrop"
        data-state={open ? "open" : "closed"}
        onClick={() => setOpen(false)}
      />

      {/* Panel container untuk widget Sketch */}
      <div
        id="sketch-panel"
        ref={panelRef}
        className={`sketch-panel ${cornerClass}`}
        data-state={open ? "open" : "closed"}
        role="dialog"
        aria-modal="false"
        // cegah drag peta ketika interaksi di panel
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* ArcGIS Sketch akan dirender di sini oleh 'container: panelRef.current' */}
        {/* Tambahan tombol util opsional */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button
            onClick={() => {
              // hapus semua grafis di layer sketch
              layerRef.current?.removeAll();
            }}
          >
            Clear
          </button>
          <button onClick={() => setOpen(false)}>Done</button>
        </div>
      </div>
    </>
  );
}
