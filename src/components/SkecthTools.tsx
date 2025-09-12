// src/components/SkecthTools.tsx
import { useEffect, useRef, useState } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Sketch from "@arcgis/core/widgets/Sketch";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type Props = {
  map: Map | null;
  view: MapView | null;
  /** Posisi tombol (desktop). Mobile tetap bottom-sheet via CSS/compact style */
  corner?: Corner;
  /** Panel awal terbuka (default: false) */
  defaultOpen?: boolean;
};

export default function SkecthTools({
  map,
  view,
  corner = "top-right",
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [compact, setCompact] = useState(false); // aktif di layar kecil/landscape

  const layerRef = useRef<GraphicsLayer | null>(null);
  const sketchRef = useRef<Sketch | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Responsif: set compact untuk mobile / height pendek
  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 768px)");
    const mqShort = window.matchMedia("(max-height: 540px)");

    const update = () => setCompact(mqMobile.matches || mqShort.matches);

    update();
    mqMobile.addEventListener("change", update);
    mqShort.addEventListener("change", update);
    return () => {
      mqMobile.removeEventListener("change", update);
      mqShort.removeEventListener("change", update);
    };
  }, []);

  // Siapkan GraphicsLayer (satu per map)
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

  // Inisialisasi Sketch saat view + panel + layer siap
  useEffect(() => {
    if (!view || !panelRef.current || !layerRef.current) return;

    const sketch = new Sketch({
      view,
      layer: layerRef.current,
      container: panelRef.current, // render di panel custom
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
      sketchRef.current?.destroy();
      sketchRef.current = null;
    };
  }, [view]);

  // Kelas util posisi (desktop). Mobile di-handle oleh compact style + CSS mu.
  const cornerClass =
    corner === "top-left"
      ? "top-3 left-3"
      : corner === "top-right"
      ? "top-3 right-3"
      : corner === "bottom-left"
      ? "bottom-3 left-3"
      : "bottom-3 right-3";

  // Gaya compact (mobile/height pendek) langsung dari komponen (override CSS)
  const compactPanelStyle: React.CSSProperties = compact
    ? {
        // sempit dan rendah agar map tetap terlihat
        width: "min(92vw, 520px)",
        maxHeight: "25svh",
        padding: "1px 8px",
        // kecilkan UI bawaan ArcGIS di dalam panel
        fontSize: 12,
        lineHeight: 1.2,
      }
    : {};

  // Bar tombol sticky di bawah panel (hemat ruang, selalu terlihat)
  const actionsBarStyle: React.CSSProperties = {
    position: "sticky",
    bottom: 0,
    background: "linear-gradient(to top, #fff 75%, rgba(255,255,255,0))",
    paddingTop: 8,
    marginTop: 8,
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
  };

  // Gaya tombol
  const btnClearStyle: React.CSSProperties = {
    padding: "6px 14px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#dc2626",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all .2s ease",
  };
  const btnDoneStyle: React.CSSProperties = {
    padding: "6px 14px",
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(37,99,235,.3)",
    transition: "background .2s ease",
  };

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
        ⚙️
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
        style={compactPanelStyle}
        // cegah drag peta ketika interaksi di panel
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Bar aksi sticky */}
        <div style={actionsBarStyle}>
          <button
            onClick={() => layerRef.current?.removeAll()}
            style={btnClearStyle}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.background = "#fef2f2")}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.background = "#fff")}
          >
            ✖ Clear
          </button>

          <button
            onClick={() => setOpen(false)}
            style={btnDoneStyle}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.background = "#1e4ed8")}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.background = "#2563eb")}
          >
            ✔ Done
          </button>
        </div>
      </div>
    </>
  );
}
