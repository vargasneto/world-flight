"use client";

import { MapPin } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { fitRoute, Map, MapMarker, MapRoute, useMap } from "@/components/mapcn/map";
import { interpolateRoute } from "@/lib/route";
import type { FlightViewModel } from "@/types/flight";
import { Plane3DMarker } from "./plane-3d-marker";

function NearbyPlaneMarker() {
  return (
    <div className="grid h-11 w-14 place-items-center" aria-hidden>
      <Image
        src="/airplane-silhouette.svg"
        alt=""
        width={48}
        height={36}
        className="h-9 w-12 object-contain opacity-90 drop-shadow-[0_7px_10px_rgba(15,23,42,0.42)]"
        draggable={false}
      />
    </div>
  );
}

function FlightNumberTag({ number, selected = false }: { number: string; selected?: boolean }) {
  return (
    <div
      className={[
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-extrabold leading-none tracking-normal shadow-[0_8px_22px_rgba(15,23,42,0.32)] backdrop-blur-md",
        selected
          ? "border-blue-700/25 bg-white/96 text-slate-950 ring-2 ring-blue-500/45"
          : "border-slate-900/15 bg-white/94 text-slate-900 ring-1 ring-white/90",
      ].join(" ")}
    >
      <span
        className={[
          "size-2.5 rounded-full border shadow-[0_0_0_2px_rgba(255,255,255,0.95)]",
          selected ? "border-blue-800 bg-blue-600" : "border-blue-700 bg-blue-500",
        ].join(" ")}
      />
      <span className="drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]">{number}</span>
    </div>
  );
}

function FlightMapContent({
  flights,
  selectedFlight,
  onSelectFlight,
}: {
  flights: FlightViewModel[];
  selectedFlight?: FlightViewModel;
  onSelectFlight: (flightId: string) => void;
}) {
  const { map } = useMap();
  const [progress, setProgress] = useState(0);
  const selectedFlightIdRef = useRef<string | undefined>(selectedFlight?.id);

  useEffect(() => {
    selectedFlightIdRef.current = selectedFlight?.id;
  }, [selectedFlight?.id]);

  useEffect(() => {
    if (!selectedFlight) return;
    fitRoute(map, selectedFlight.route);
    setProgress(0);
  }, [selectedFlight, map]);

  useEffect(() => {
    if (flights.length === 0) return;

    let frame = 0;
    let start = 0;
    const duration = 18_000;

    function animate(timestamp: number) {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) % duration;
      setProgress(elapsed / duration);
      frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [flights.length]);

  const planes = useMemo(
    () =>
      flights.map((flight, index) => ({
        flight,
        plane: interpolateRoute(flight.route, (progress + index * 0.07) % 1),
      })),
    [flights, progress],
  );

  if (flights.length === 0) return null;

  return (
    <>
      {planes.map(({ flight, plane }, index) => {
        const selected = flight.id === selectedFlight?.id;

        return (
          <div key={flight.id}>
            <MapRoute
              id={`flight-route-${flight.id}`}
              coordinates={flight.route}
              color={selected ? "#2563eb" : "#64748b"}
              width={selected ? 3 : 2}
              dashArray={selected ? [2, 2] : [1, 3]}
            />
            {selected && (
              <>
                <MapMarker coordinates={flight.departure.position}>
                  <div className="grid size-8 place-items-center rounded-full border-2 border-white bg-accent text-white shadow-lg">
                    <MapPin size={15} />
                  </div>
                </MapMarker>
                <MapMarker coordinates={flight.arrival.position}>
                  <div className="grid size-8 place-items-center rounded-full border-2 border-white bg-route text-white shadow-lg">
                    <MapPin size={15} />
                  </div>
                </MapMarker>
              </>
            )}
            <MapMarker
              coordinates={plane.position}
              rotation={plane.bearing}
              className="plane-marker"
              onClick={() => {
                if (selectedFlightIdRef.current !== flight.id) {
                  onSelectFlight(flight.id);
                }
              }}
            >
              {selected ? (
                <Plane3DMarker />
              ) : (
                <NearbyPlaneMarker />
              )}
            </MapMarker>
            {(selected || index < 8) && (
              <MapMarker
                coordinates={plane.position}
                onClick={() => {
                  if (selectedFlightIdRef.current !== flight.id) {
                    onSelectFlight(flight.id);
                  }
                }}
              >
                <div className="translate-y-7">
                  <FlightNumberTag number={flight.number} selected={selected} />
                </div>
              </MapMarker>
            )}
          </div>
        );
      })}
    </>
  );
}

export function FlightMap({
  flights,
  selectedFlight,
  onSelectFlight,
}: {
  flights: FlightViewModel[];
  selectedFlight?: FlightViewModel;
  onSelectFlight: (flightId: string) => void;
}) {
  const center = selectedFlight?.current?.position ?? selectedFlight?.departure.position ?? [-30, 25];

  return (
    <Map center={center} zoom={selectedFlight ? 3 : 2} className="absolute inset-0">
      <FlightMapContent flights={flights} selectedFlight={selectedFlight} onSelectFlight={onSelectFlight} />
    </Map>
  );
}
