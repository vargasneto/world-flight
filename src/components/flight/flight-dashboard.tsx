"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { FlightMap } from "./flight-map";
import { FlightPanel } from "./flight-panel";
import { FlightSearch } from "./flight-search";
import type { FlightSearchResponse, FlightViewModel } from "@/types/flight";

async function fetchFlight(query: string, signal?: AbortSignal) {
  const response = await fetch(`/api/flights/search?q=${encodeURIComponent(query)}`, {
    signal,
    cache: "no-store",
  });
  const payload = (await response.json()) as FlightSearchResponse;
  if (!payload.ok) throw new Error(payload.message);
  return payload;
}

export function FlightDashboard() {
  const [flights, setFlights] = useState<FlightViewModel[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState<string>();
  const [query, setQuery] = useState("DL47");
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [error, setError] = useState<string>();

  const search = useCallback(async (nextQuery: string) => {
    const trimmed = nextQuery.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(undefined);
    setQuery(trimmed);

    try {
      const result = await fetchFlight(trimmed);
      setFlights(result.flights);
      setSelectedFlightId(result.selectedFlightId ?? result.flights[0]?.id);
      setError(result.warnings?.length ? result.warnings.join(" | ") : undefined);
      setPanelOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar voo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void search("DL47");
  }, [search]);

  useEffect(() => {
    if (flights.length === 0) return;

    const interval = window.setInterval(async () => {
      try {
        const result = await fetchFlight(query);
        setFlights(result.flights);
        setSelectedFlightId((current) =>
          current && result.flights.some((flight) => flight.id === current)
            ? current
            : result.selectedFlightId ?? result.flights[0]?.id,
        );
      } catch {
        // Mantem o ultimo voo visivel se uma atualizacao incremental falhar.
      }
    }, 45_000);

    return () => window.clearInterval(interval);
  }, [flights.length, query]);

  const selectedFlight = flights.find((flight) => flight.id === selectedFlightId) ?? flights[0];

  return (
    <main className="relative h-dvh min-h-[620px] overflow-hidden bg-background">
      <FlightMap flights={flights} selectedFlight={selectedFlight} onSelectFlight={setSelectedFlightId} />

      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(246,244,239,0.82)_0%,rgba(246,244,239,0.25)_34%,rgba(246,244,239,0)_64%)]" />

      <div className="pointer-events-auto absolute left-4 right-4 top-4 z-30 flex flex-col gap-3 md:left-[400px] md:right-auto md:w-[min(560px,calc(100vw-424px))]">
        <FlightSearch onSearch={search} loading={loading} />
        {error && (
          <div className="flex max-w-xl items-center gap-2 rounded-lg border border-warning/30 bg-white/95 px-4 py-3 text-sm font-medium text-warning shadow-panel">
            <AlertTriangle size={17} />
            {error}
          </div>
        )}
      </div>

      <FlightPanel
        flight={selectedFlight}
        flights={flights}
        open={panelOpen}
        onToggle={() => setPanelOpen((value) => !value)}
        onSelectFlight={setSelectedFlightId}
      />

      <div className="pointer-events-none absolute bottom-4 right-4 z-20 rounded-md bg-white/90 px-3 py-2 text-xs font-semibold text-black/55 shadow-panel">
        {selectedFlight?.source === "mock" ? "Mock ativo" : "AeroDataBox ativo"} · {flights.length} voo(s)
      </div>
    </main>
  );
}
