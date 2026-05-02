import type { FlightViewModel } from "@/types/flight";
import { getCachedFlight, setCachedFlight } from "./cache";
import { FlightProviderError } from "./errors";
import { searchAeroDataBoxFlight } from "./aerodatabox";
import { demoFlightNumbers, searchMockFlight, searchMockFlights } from "./mock";

export async function searchFlight(query: string): Promise<{ flight: FlightViewModel; cached: boolean }> {
  const normalizedQuery = query.trim().toUpperCase();

  if (!normalizedQuery) {
    throw new FlightProviderError("Informe um numero de voo.", "NOT_FOUND");
  }

  const cached = getCachedFlight(normalizedQuery);
  if (cached) return { flight: cached, cached: true };

  const provider = process.env.FLIGHT_DATA_PROVIDER ?? "mock";
  const flight =
    provider === "aerodatabox"
      ? await searchAeroDataBoxFlight(normalizedQuery)
      : await searchMockFlight(normalizedQuery);

  setCachedFlight(normalizedQuery, flight);

  return { flight, cached: false };
}

function parseFlightQueries(query: string) {
  const normalized = query.trim();
  if (/^(demo|multi|varios|vários)$/i.test(normalized)) return demoFlightNumbers();

  return normalized
    .split(/[\s,;]+/)
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 12);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function searchFlights(query: string): Promise<{
  flights: FlightViewModel[];
  selectedFlightId?: string;
  cached: boolean;
  warnings?: string[];
}> {
  const queries = parseFlightQueries(query);

  if (queries.length === 0) {
    throw new FlightProviderError("Informe pelo menos um numero de voo.", "NOT_FOUND");
  }

  const provider = process.env.FLIGHT_DATA_PROVIDER ?? "mock";

  if (provider !== "aerodatabox" || /^(demo|multi|varios|vários)$/i.test(query.trim())) {
    const flights = await searchMockFlights(queries);
    return { flights, selectedFlightId: flights[0]?.id, cached: false };
  }

  const flights: FlightViewModel[] = [];
  const warnings: string[] = [];
  let allCached = true;

  for (const [index, flightQuery] of queries.entries()) {
    try {
      if (index > 0) await wait(1100);
      const result = await searchFlight(flightQuery);
      flights.push(result.flight);
      allCached = allCached && result.cached;
    } catch (error) {
      warnings.push(error instanceof Error ? `${flightQuery}: ${error.message}` : `${flightQuery}: erro inesperado`);
    }
  }

  if (flights.length === 0) {
    throw new FlightProviderError(warnings[0] ?? "Nenhum voo encontrado.", "PROVIDER_ERROR");
  }

  return { flights, selectedFlightId: flights[0]?.id, cached: allCached, warnings };
}

export { FlightProviderError };
