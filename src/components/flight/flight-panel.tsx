"use client";

import { ChevronLeft, ChevronRight, Clock, Gauge, MapPin, PlaneTakeoff, RadioTower } from "lucide-react";
import type { FlightViewModel } from "@/types/flight";
import { formatDateTime, formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-black/10 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-black/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function FlightPanel({
  flight,
  flights,
  open,
  onToggle,
  onSelectFlight,
}: {
  flight?: FlightViewModel;
  flights: FlightViewModel[];
  open: boolean;
  onToggle: () => void;
  onSelectFlight: (flightId: string) => void;
}) {
  return (
    <aside
      className={cn(
        "pointer-events-auto absolute left-4 top-24 z-20 w-[min(360px,calc(100vw-2rem))] transition-transform duration-300",
        !open && "-translate-x-[calc(100%-3.25rem)]",
      )}
    >
      <div className="overflow-hidden rounded-lg border border-black/10 bg-panel shadow-panel">
        <div className="flex items-center justify-between border-b border-black/10 p-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">Detalhes do voo</p>
            <h1 className="truncate text-2xl font-bold">{flight?.number ?? "Nenhum voo"}</h1>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="grid size-10 shrink-0 place-items-center rounded-md border border-black/10 bg-white text-foreground transition hover:bg-black hover:text-white"
            aria-label={open ? "Ocultar painel" : "Mostrar painel"}
          >
            {open ? <ChevronLeft size={19} /> : <ChevronRight size={19} />}
          </button>
        </div>

        <div className={cn("space-y-4 p-4", !open && "invisible")}>
          {!flight ? (
            <p className="text-sm leading-6 text-black/60">
              Busque um voo para visualizar origem, destino, status e telemetria.
            </p>
          ) : (
            <>
              <div className="flex items-start gap-3 rounded-md bg-accent p-4 text-white">
                <PlaneTakeoff className="mt-0.5 shrink-0" size={22} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{flight.airline ?? "Companhia nao informada"}</p>
                  <p className="text-sm text-white/80">
                    {flight.departure.iata ?? flight.departure.icao} para{" "}
                    {flight.arrival.iata ?? flight.arrival.icao}
                  </p>
                </div>
              </div>

              {flights.length > 1 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-black/45">
                    Voos no mapa ({flights.length})
                  </p>
                  <div className="max-h-44 space-y-2 overflow-auto pr-1">
                    {flights.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectFlight(item.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition",
                          item.id === flight.id
                            ? "border-accent bg-accent/10 text-foreground"
                            : "border-black/10 bg-white text-black/65 hover:border-black/25",
                        )}
                      >
                        <span className="font-semibold">{item.number}</span>
                        <span className="truncate pl-3 text-xs">{item.departure.iata} - {item.arrival.iata}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Detail label="Status" value={flight.status} />
                <Detail label="Fonte" value={flight.source} />
                <Detail label="Partida" value={formatDateTime(flight.actualDeparture ?? flight.scheduledDeparture)} />
                <Detail label="Chegada" value={formatDateTime(flight.actualArrival ?? flight.scheduledArrival)} />
              </div>

              <div className="space-y-2">
                <div className="flex gap-3 rounded-md border border-black/10 bg-white p-3">
                  <MapPin className="mt-0.5 shrink-0 text-accent" size={18} />
                  <div>
                    <p className="text-sm font-semibold">{flight.departure.name}</p>
                    <p className="text-xs text-black/55">{flight.departure.city ?? "Origem"}</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-md border border-black/10 bg-white p-3">
                  <MapPin className="mt-0.5 shrink-0 text-route" size={18} />
                  <div>
                    <p className="text-sm font-semibold">{flight.arrival.name}</p>
                    <p className="text-xs text-black/55">{flight.arrival.city ?? "Destino"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Detail label="Altitude" value={formatNumber(flight.current?.altitudeMeters, " m")} />
                <Detail label="Velocidade" value={formatNumber(flight.current?.speedKmh, " km/h")} />
              </div>

              <div className="flex items-center gap-2 text-xs text-black/55">
                <Clock size={14} />
                <span>Atualizado em {formatDateTime(flight.current?.updatedAt ?? flight.fetchedAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-black/55">
                <RadioTower size={14} />
                <span>Polling leve apenas com voo ativo.</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-black/55">
                <Gauge size={14} />
                <span>{flight.current ? "Posicao real quando disponivel." : "Animacao estimada pela rota."}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
