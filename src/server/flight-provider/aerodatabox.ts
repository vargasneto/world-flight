import { buildCurvedRoute } from "@/lib/route";
import type { FlightAirport, FlightPosition, FlightViewModel, LngLat } from "@/types/flight";
import { FlightProviderError } from "./errors";

type AeroDataBoxAirport = {
  name?: string;
  iata?: string;
  icao?: string;
  municipalityName?: string;
  location?: {
    lat?: number;
    lon?: number;
  };
};

type AeroDataBoxFlight = {
  number?: string;
  callSign?: string;
  status?: string;
  airline?: { name?: string };
  aircraft?: { model?: string; reg?: string };
  departure?: {
    airport?: AeroDataBoxAirport;
    scheduledTime?: { utc?: string; local?: string };
    revisedTime?: { utc?: string; local?: string };
    actualTime?: { utc?: string; local?: string };
  };
  arrival?: {
    airport?: AeroDataBoxAirport;
    scheduledTime?: { utc?: string; local?: string };
    revisedTime?: { utc?: string; local?: string };
    actualTime?: { utc?: string; local?: string };
  };
  location?: {
    lat?: number;
    lon?: number;
    altitude?: { meter?: number };
    groundSpeed?: { kmPerHour?: number };
    trueTrack?: number;
    updateTimeUtc?: string;
  };
};

function assertPosition(value?: { lat?: number; lon?: number }): LngLat | undefined {
  if (typeof value?.lat !== "number" || typeof value.lon !== "number") return undefined;
  return [value.lon, value.lat];
}

function normalizeAirport(airport: AeroDataBoxAirport | undefined, fallbackName: string): FlightAirport {
  const position = assertPosition(airport?.location);

  if (!position) {
    throw new FlightProviderError(
      `A AeroDataBox nao retornou coordenadas para ${fallbackName}.`,
      "PROVIDER_ERROR",
    );
  }

  return {
    name: airport?.name ?? fallbackName,
    city: airport?.municipalityName,
    iata: airport?.iata,
    icao: airport?.icao,
    position,
  };
}

function normalizePosition(flight: AeroDataBoxFlight): FlightPosition | undefined {
  const position = assertPosition(flight.location);
  if (!position) return undefined;

  return {
    position,
    altitudeMeters: flight.location?.altitude?.meter,
    speedKmh: flight.location?.groundSpeed?.kmPerHour,
    bearingDegrees: flight.location?.trueTrack,
    updatedAt: flight.location?.updateTimeUtc,
  };
}

function chooseFlight(payload: unknown): AeroDataBoxFlight | undefined {
  if (Array.isArray(payload)) return payload[0] as AeroDataBoxFlight | undefined;
  if (payload && typeof payload === "object" && "flights" in payload) {
    const flights = (payload as { flights?: unknown }).flights;
    if (Array.isArray(flights)) return flights[0] as AeroDataBoxFlight | undefined;
  }
  return payload as AeroDataBoxFlight | undefined;
}

function normalizeAeroDataBoxFlight(payload: unknown, query: string): FlightViewModel {
  const flight = chooseFlight(payload);

  if (!flight?.departure?.airport || !flight.arrival?.airport) {
    throw new FlightProviderError("Voo nao encontrado na AeroDataBox.", "NOT_FOUND");
  }

  const departure = normalizeAirport(flight.departure.airport, "Origem");
  const arrival = normalizeAirport(flight.arrival.airport, "Destino");

  return {
    id: `aerodatabox-${flight.number ?? query}`,
    number: flight.number ?? query.toUpperCase(),
    callsign: flight.callSign,
    airline: flight.airline?.name,
    aircraft: flight.aircraft?.model ?? flight.aircraft?.reg,
    status: flight.status ?? "Unknown",
    departure,
    arrival,
    scheduledDeparture: flight.departure.scheduledTime?.utc ?? flight.departure.scheduledTime?.local,
    scheduledArrival: flight.arrival.scheduledTime?.utc ?? flight.arrival.scheduledTime?.local,
    actualDeparture: flight.departure.actualTime?.utc ?? flight.departure.revisedTime?.utc,
    actualArrival: flight.arrival.actualTime?.utc ?? flight.arrival.revisedTime?.utc,
    current: normalizePosition(flight),
    route: buildCurvedRoute(departure.position, arrival.position),
    source: "aerodatabox",
    fetchedAt: new Date().toISOString(),
  };
}

export async function searchAeroDataBoxFlight(query: string): Promise<FlightViewModel> {
  const key = process.env.RAPIDAPI_KEY;
  const host = process.env.RAPIDAPI_HOST ?? "aerodatabox.p.rapidapi.com";

  if (!key) {
    throw new FlightProviderError("RAPIDAPI_KEY nao configurada.", "PROVIDER_ERROR");
  }

  const url = new URL(`https://${host}/flights/number/${encodeURIComponent(query)}`);
  url.searchParams.set("withAircraftImage", "false");
  url.searchParams.set("withLocation", "true");

  const response = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": host,
    },
    next: { revalidate: 30 },
  });

  if (response.status === 404) {
    throw new FlightProviderError("Voo nao encontrado.", "NOT_FOUND");
  }

  if (response.status === 429) {
    throw new FlightProviderError("Limite da API atingido.", "RATE_LIMITED");
  }

  if (response.status === 401 || response.status === 403) {
    throw new FlightProviderError(
      "A RapidAPI recusou a chave. Confirme se voce assinou a API AeroDataBox no RapidAPI e se RAPIDAPI_HOST/RAPIDAPI_KEY estao corretos.",
      "FORBIDDEN",
    );
  }

  if (!response.ok) {
    throw new FlightProviderError(`AeroDataBox retornou HTTP ${response.status}.`, "PROVIDER_ERROR");
  }

  return normalizeAeroDataBoxFlight(await response.json(), query);
}
