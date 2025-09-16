// src/App.tsx
import { useRef, useState } from "react";
import ArcMap from "./components/ArcMap";
import type { MarkerItem } from "./components/MarkerLayer";
import MarkerLayer from "./components/MarkerLayer";
import SketchTools from "./components/SkecthTools";
import MeasurementTools from "./components/MeasurementTools";
import LocateControl from "./components/Locate";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";

import "./App.css";

export default function App() {
  const [map, setMap] = useState<Map | null>(null);
  const [view, setView] = useState<MapView | null>(null);

  // Flag untuk mencegah MarkerLayer auto-fit saat Locate aktif
  const suppressAutoGoToRef = useRef(false);

  // Titik awal (opsional, default peta di Banjarmasin)
  const center: [number, number] = [114.831928, -3.440115,];

  // Data marker default
  const markers: MarkerItem[] = [
    {
      id: "kantor-gub",
      lng: 114.83371,
      lat: -3.48415,
      title: "Kantor Gubernur Kalsel",
      description:
        "Jalan Aneka Tambang, Trikora, Palam, Kec. Cemp., Kota Banjar Baru, Kalimantan Selatan 70114",
      color: "red",
    },
  ];

  return (
    <div className="app">
      <ArcMap
        center={center}
        zoom={10}
        basemap="hybrid"
        onReady={({ map, view }) => {
          setMap(map);
          setView(view);
        }}
      />

      {/* Marker layer dengan guard supaya tidak override lokasi user */}
      <MarkerLayer
        map={map}
        view={view as any}
        markers={markers}
        autoFit={true}
        suppressAutoGoToRef={suppressAutoGoToRef}
      />

      {/* Sketch tools */}
      <SketchTools map={map} view={view} corner="top-right" />

      {/* Measurement tools */}
      <MeasurementTools map={map} view={view} corner="top-left" />

      {/* Locate control */}
      <LocateControl
        view={view}
        corner="bottom-left"
        zoom={11}
        useHeading={true}
        onBeforeLocate={() => {
          suppressAutoGoToRef.current = true;
        }}
        onAfterLocate={() => {
          // Reset flag setelah 2 detik biar MarkerLayer bisa auto-fit lagi
          setTimeout(() => {
            suppressAutoGoToRef.current = false;
          }, 2000);
        }}
      />
    </div>
  );
}
