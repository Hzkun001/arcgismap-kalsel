import { useState } from "react";
import ArcMap from "./components/ArcMap";
import MarkerLayer from "./components/MarkerLayer";
import type { MarkerItem } from "./components/MarkerLayer";
import SketchTools from "./components/SkecthTools";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import MeasurementTools from "./components/MeasurementTools";
import "./App.css";

export default function App() {
  const [map, setMap] = useState<Map | null>(null);
  const [view, setView] = useState<MapView | null>(null);

  // Titik awal (Google Maps → [lng, lat])
  const center: [number, number] = [114.83371, -3.48415];

  // Data marker
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
        zoom={16}
        basemap="hybrid"
        onReady={({ map, view }) => {
          setMap(map);
          setView(view);
        }}
      />
      {/* Layer marker */}
      <MarkerLayer map={map} view={view as any} markers={markers} autoFit={false} />
      <SketchTools map={map} view={view} corner="top-right" />
        {/* Measurement tools */}
    <MeasurementTools map={map} view={view} corner="top-left" />
    </div>
  );
}
