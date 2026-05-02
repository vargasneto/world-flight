"use client";

import maplibregl, { type LngLatBoundsLike, type Map as MapLibreMap } from "maplibre-gl";
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { LngLat } from "@/types/flight";
import { cn } from "@/lib/cn";

type MapContextValue = {
  map: MapLibreMap | null;
};

const MapContext = createContext<MapContextValue>({ map: null });

export function useMap() {
  return useContext(MapContext);
}

export function Map({
  center,
  zoom = 2,
  children,
  className,
}: {
  center: LngLat;
  zoom?: number;
  children: ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const initialCenterRef = useRef(center);
  const initialZoomRef = useRef(zoom);
  const [map, setMap] = useState<MapLibreMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let disposed = false;

    const instance = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/bright",
      center: initialCenterRef.current,
      zoom: initialZoomRef.current,
      attributionControl: false,
    });

    mapRef.current = instance;
    instance.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    instance.once("load", () => {
      if (!disposed) setMap(instance);
    });

    return () => {
      disposed = true;
      setMap(null);
      instance.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <MapContext.Provider value={{ map }}>
      <div ref={containerRef} className={cn("h-full w-full", className)} />
      {children}
    </MapContext.Provider>
  );
}

export function MapRoute({
  id,
  coordinates,
  color = "#2563eb",
  width = 3,
  dashArray = [2, 2],
}: {
  id: string;
  coordinates: LngLat[];
  color?: string;
  width?: number;
  dashArray?: number[];
}) {
  const { map } = useMap();

  useEffect(() => {
    if (!map || coordinates.length < 2) return;

    const sourceId = `${id}-source`;
    const layerId = `${id}-layer`;
    const data = {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates,
      },
    };

    const addOrUpdate = () => {
      if (!map.isStyleLoaded()) return;

      const source = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
      if (source) {
        source.setData(data);
        return;
      }

      map.addSource(sourceId, { type: "geojson", data });
      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": color,
          "line-width": width,
          "line-opacity": 0.86,
          "line-dasharray": dashArray,
        },
      });
    };

    if (map.isStyleLoaded()) addOrUpdate();
    else map.once("load", addOrUpdate);

    return () => {
      map.off("load", addOrUpdate);

      try {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }

        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      } catch {
        // MapLibre can clear its style during Fast Refresh or unmount before child effects clean up.
      }
    };
  }, [color, coordinates, dashArray, id, map, width]);

  return null;
}

export function MapMarker({
  coordinates,
  children,
  rotation = 0,
  className,
  onClick,
}: {
  coordinates: LngLat;
  children: ReactNode;
  rotation?: number;
  className?: string;
  onClick?: () => void;
}) {
  const { map } = useMap();
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [element] = useState(() => {
    if (typeof document === "undefined") return null;

    const markerElement = document.createElement("div");
    markerElement.className = cn("grid place-items-center", onClick && "cursor-pointer", className);
    return markerElement;
  });

  useEffect(() => {
    if (!element) return;
    element.className = cn("grid place-items-center", onClick && "cursor-pointer", className);
    element.onclick = onClick ?? null;
  }, [className, element, onClick]);

  useEffect(() => {
    if (!map || !element || markerRef.current) return;

    markerRef.current = new maplibregl.Marker({
      element,
      rotationAlignment: "map",
    })
      .setLngLat([0, 0])
      .addTo(map);

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
    };
  }, [element, map]);

  useEffect(() => {
    markerRef.current?.setLngLat(coordinates).setRotation(rotation);
  }, [coordinates, rotation]);

  if (!element) return null;

  return createPortal(children, element);
}

export function fitRoute(map: MapLibreMap | null, coordinates: LngLat[], padding = 90) {
  if (!map || coordinates.length < 2) return;

  const bounds = coordinates.reduce(
    (current, coordinate) => current.extend(coordinate),
    new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
  );

  map.fitBounds(bounds as LngLatBoundsLike, {
    padding,
    maxZoom: 5,
    duration: 900,
  });
}
