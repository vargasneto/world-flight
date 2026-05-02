import type { FlightViewModel } from "@/types/flight";

type CacheEntry = {
  expiresAt: number;
  flight: FlightViewModel;
};

const cache = new Map<string, CacheEntry>();
const ttlMs = 45_000;

export function getCachedFlight(query: string) {
  const key = query.toUpperCase();
  const entry = cache.get(key);

  if (!entry || entry.expiresAt < Date.now()) {
    cache.delete(key);
    return undefined;
  }

  return entry.flight;
}

export function setCachedFlight(query: string, flight: FlightViewModel) {
  cache.set(query.toUpperCase(), {
    expiresAt: Date.now() + ttlMs,
    flight,
  });
}
