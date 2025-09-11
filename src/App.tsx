import { useEffect, useRef } from "react";
import "./App.css";
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";

function App() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Lokasi dari Google Maps (lat, lng) → ArcGIS [lng, lat]
    const gmapsLat = -3.48415;
    const gmapsLng = 114.83371;

    const map = new Map({
      basemap: "osm",
    });

    const view = new MapView({
      map,
      container: mapRef.current,
      center: [gmapsLng, gmapsLat],
      zoom: 17,
    });

    // Buat layer untuk marker
    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    // Marker point
    const point = {
      type: "point",
      longitude: gmapsLng,
      latitude: gmapsLat,
    };

    // Simbol marker
    const markerSymbol = {
      type: "simple-marker",
      color: "red",
      size: "12px",
      outline: {
        color: "white",
        width: 1,
      },
    };

    // Data popup
    const attributes = {
      name: "Lokasi Kantor Gubernur Kalsel",
      description: "Jalan Aneka Tambang, Trikora, Palam, Kec. Cemp., Kota Banjar Baru, Kalimantan Selatan 70114",
    };

    // Template popup
    const popupTemplate = {
      title: "{name}",
      content: "{description}",
    };

    // Gabungkan jadi Graphic
    const pointGraphic = new Graphic({
      geometry: point,
      symbol: markerSymbol,
      attributes,
      popupTemplate,
    });

    // Tambahkan ke layer
    graphicsLayer.add(pointGraphic);

    return () => view && view.destroy();
  }, []);

  return <div className="viewDiv" ref={mapRef}></div>;
}

export default App;
