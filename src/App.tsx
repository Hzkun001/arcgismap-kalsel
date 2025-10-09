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

import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";

// ⬇️ Pastikan tsconfig.json punya: "resolveJsonModule": true
import batasObj from "./assets/data/batas_kota.json";

import "./App.css";

// Map tipe field EsriJSON -> tipe singkat JS API
const esriTypeToJsType = (t?: string) => {
  switch ((t || "").toLowerCase()) {
    case "esrifieldtypeoid": return "oid";
    case "esrifieldtypestring": return "string";
    case "esrifieldtypedate": return "date";
    case "esrifieldtypedouble": return "double";
    case "esrifieldtypesingle": return "single";
    case "esrifieldtypelong": return "integer";
    case "esrifieldtypesmallinteger": return "small-integer";
    case "esrifieldtypeinteger": return "integer";
    default: return "string";
  }
};

export default function App() {
  const [map, setMap] = useState<Map | null>(null);
  const [view, setView] = useState<MapView | null>(null);
  const suppressAutoGoToRef = useRef(false);

  const center: [number, number] = [114.831928, -3.440115];

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
        zoom={15}
        basemap="osm"
        onReady={({ map, view }) => {
          setMap(map);
          setView(view);

          try {
            const json = batasObj as any; // EsriJSON FeatureSet export
            const spatialReference = json.spatialReference ?? { wkid: 4326 };

            console.log("Feature count dari JSON:", json.features?.length);

            // 1) Filter geometry valid (punya rings)
            const rawFeatures: any[] = Array.isArray(json.features) ? json.features : [];
            const validFeatures = rawFeatures.filter((f) => {
              const g = f?.geometry;
              return g && Array.isArray(g.rings) && g.rings.length > 0;
            });
            console.log("Valid features (geometry OK):", validFeatures.length);

            // 2) Konversi ke Graphic[]
            const source = validFeatures.map((feat: any, i: number) =>
              new Graphic({
                attributes: { OBJECTID: i + 1, ...(feat.attributes ?? {}) },
                geometry: new Polygon({
                  rings: feat.geometry.rings,
                  spatialReference,
                }),
              })
            ) as __esri.Graphic[];

            // 3) Map fields & pastikan ada OID
            const hasOid = (json.fields ?? []).some(
              (f: any) => (f.type || "").toLowerCase() === "esrifieldtypeoid"
            );
            const mappedFields = (json.fields ?? []).map((f: any) => ({
              name: f.name,
              alias: f.alias ?? f.name,
              type: esriTypeToJsType(f.type),
              length: f.length,
              domain: f.domain,
              nullable: f.nullable ?? true,
            }));
            if (!hasOid) mappedFields.unshift({ name: "OBJECTID", type: "oid", alias: "OBJECTID" });
            const objectIdField = hasOid ? (json.objectIdField ?? "OBJECTID") : "OBJECTID";

            // 4) FeatureLayer client-side (geometryType literal biar TS happy)
            const batasKota = new FeatureLayer({
              title: "Batas Kota",
              source,
              fields: mappedFields,
              objectIdField,
              geometryType: "polygon", // ← literal, fix TS2322
              spatialReference,
              renderer: {
                type: "simple",
                symbol: {
                  type: "simple-fill",
                  color: [0, 120, 255, 0.1], // ubah alpha untuk transparansi
                  outline: { color: [0, 80, 200, 200], width: 1 }, // outline kontras
                } as any
              },
              popupTemplate: {
                title: "{namobj}",
                content: [{
                  type: "fields",
                  fieldInfos: [
                    { fieldName: "namobj", label: "Nama Objek" },
                    { fieldName: "wadmkc", label: "Kecamatan" },
                    { fieldName: "wadmkk", label: "Kab/Kota" },
                    { fieldName: "wadmpr", label: "Provinsi" },
                    { fieldName: "shape_area", label: "Luas (derajat²)" },
                  ],
                }],
              },
            });

            // 5) Label
            const label = new LabelClass({
              labelExpressionInfo: { expression: "$feature.namobj" },
              symbol: {
                type: "text",
                font: { size: 10, weight: "bold" },
                haloColor: "white",
                haloSize: 1,
              } as any,
            });
            batasKota.labelsVisible = true;
            batasKota.labelingInfo = [label];

            // 6) Tambahkan layer di bawah marker
            map.add(batasKota, 0);

            // 7) Zoom ke extent (jeda kecil agar tidak “rebutan” dengan MarkerLayer)
            batasKota.when(async () => {
              const count = await batasKota.queryFeatureCount();
              console.log("Feature count (layer siap):", count);

              suppressAutoGoToRef.current = true;
              if (batasKota.fullExtent) {
                setTimeout(() => {
                  view.goTo(batasKota.fullExtent).catch(() => {});
                  setTimeout(() => (suppressAutoGoToRef.current = false), 400);
                }, 50);
              } else {
                console.warn("fullExtent belum tersedia");
                suppressAutoGoToRef.current = false;
              }
            });

            view.on("layerview-create-error", (e) =>
              console.error("LayerView error detail:", e.error)
            );
          } catch (err) {
            console.error("Gagal memuat layer batas kota:", err);
          }
        }}
      />

      {/* Saat debug: autoFit dimatikan supaya kamera tidak rebutan */}
      <MarkerLayer
        map={map}
        view={view as any}
        markers={markers}
        autoFit={false}
        suppressAutoGoToRef={suppressAutoGoToRef}
      />

      <SketchTools map={map} view={view} corner="top-right" />
      <MeasurementTools map={map} view={view} corner="top-left" />
      <LocateControl
        view={view}
        corner="top-left"
        zoom={11}
        useHeading={true}
        onBeforeLocate={() => (suppressAutoGoToRef.current = true)}
        onAfterLocate={() => setTimeout(() => (suppressAutoGoToRef.current = false), 2000)}
      />
    </div>
  );
}
