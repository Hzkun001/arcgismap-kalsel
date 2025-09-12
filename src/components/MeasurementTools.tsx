// src/components/MeasurementTools.tsx
import { useEffect } from "react";
import DistanceMeasurement2D from "@arcgis/core/widgets/DistanceMeasurement2D";
import AreaMeasurement2D from "@arcgis/core/widgets/AreaMeasurement2D";
import Expand from "@arcgis/core/widgets/Expand";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";



type Props = {
  map: Map | null;
  view: MapView | null;
  corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

export default function MeasurementTools({ map, view, corner = "top-right" }: Props) {
  useEffect(() => {
    if (!view) return;

    const distanceWidget = new DistanceMeasurement2D({
      view,
      unit: "meters",
    });
    const areaWidget = new AreaMeasurement2D({
      view,
      unit: "square-meters",
    });

    const distanceExpand = new Expand({
      view,
      content: distanceWidget,
      expandIcon: "measure-line",
      expandTooltip: "Ukur Jarak",
    });
    const areaExpand = new Expand({
      view,
      content: areaWidget,
      expandIcon: "measure-area",
      expandTooltip: "Ukur Luas",
    });

    view.ui.add(distanceExpand, corner);
    view.ui.add(areaExpand, corner);

    return () => {
      distanceWidget.destroy();
      areaWidget.destroy();
      distanceExpand.destroy();
      areaExpand.destroy();
    };
  }, [view, corner, map]);

  return null; // widget ini langsung masuk ke UI MapView, jadi nggak ada DOM element
}
