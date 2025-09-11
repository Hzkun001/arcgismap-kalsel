import { useEffect, useRef } from "react";
import "./App.css";

import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";

// ✅ Kelas resmi ArcGIS (TS-friendly)
import Point from "@arcgis/core/geometry/Point";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";

function App() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Koordinat dari Google Maps (lat, lng)
    const gmapsLat = -3.48415;
    const gmapsLng = 114.83371;

    const map = new Map({ basemap: "osm" });

    const view = new MapView({
      map,
      container: mapRef.current,
      center: [gmapsLng, gmapsLat], // ArcGIS: [lng, lat]
      zoom: 17,
    });

    // Layer untuk graphic
    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    // ✅ Geometry pakai kelas Point (bukan object literal)
    const point = new Point({
      longitude: gmapsLng,
      latitude: gmapsLat,
      // spatialReference: { wkid: 4326 }, // opsional, default 4326
    });

    // ✅ Symbol pakai kelas SimpleMarkerSymbol
    const markerSymbol = new SimpleMarkerSymbol({
      color: "red",
      size: 12, // bisa number atau "12px"
      outline: { color: "white", width: 1 },
    });

    // Data popup
    const attributes = {
      name: "Lokasi Kantor Gubernur Kalsel",
      description:
        "Jalan Aneka Tambang, Trikora, Palam, Kec. Cemp., Kota Banjar Baru, Kalimantan Selatan 70114",
    };

    const popupTemplate = {
      title: "{name}",
      content: "{description}",
    };

    // Graphic final
    const pointGraphic = new Graphic({
      geometry: point,
      symbol: markerSymbol,
      attributes,
      popupTemplate,
    });

    graphicsLayer.add(pointGraphic);

    return () => {
      // bereskan resource saat unmount
      view?.destroy();
    };
  }, []);

  return <div className="viewDiv" ref={mapRef}></div>;
}

export default App;
