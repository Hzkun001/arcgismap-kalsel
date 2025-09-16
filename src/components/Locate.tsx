// src/components/Locate.tsx
import { useEffect } from "react";
import Locate from "@arcgis/core/widgets/Locate";
import type MapView from "@arcgis/core/views/MapView";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export default function LocateControl({
  view,
  corner = "top-left",
  zoom,
  scale,
  useHeading = true,
  onBeforeLocate,
  onAfterLocate,
}: {
  view: MapView | null;
  corner?: Corner;
  zoom?: number;
  scale?: number;
  useHeading?: boolean;
  onBeforeLocate?: () => void;
  onAfterLocate?: () => void;
}) {
  useEffect(() => {
    if (!view) return;

    const locate = new Locate({
      view,
      goToOverride: (v, opts) => {
        // Tentukan target lokasi + zoom/scale
        const target: __esri.GoToTarget2D = {
          target: opts.target,
          ...(zoom ? { zoom } : {}),
          ...(scale ? { scale } : {}),
        };
        return v.goTo(target, { duration: 800 });
      },
    });

    // Atur heading kalau mau
    (locate.viewModel as any).useHeadingEnabled = !!useHeading;

    // Event hook
    locate.on("locate", () => {
      onAfterLocate?.();
    });

    view.ui.add(locate, corner);

    return () => locate.destroy();
  }, [view, corner, zoom, scale, useHeading, onAfterLocate]);

  // Trigger sebelum locate saat tombol ditekan
useEffect(() => {
  if (!view) return;
  const locate = view.ui.components.find(
    (c) => (c as any).declaredClass === "esri.widgets.Locate"
  ) as __esri.Locate | undefined;
  if (locate) {
    locate.on("locate", () => onBeforeLocate?.());
  }
}, [view, onBeforeLocate]);


  return null;
}
