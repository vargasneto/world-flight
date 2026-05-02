import { buildCurvedRoute } from "@/lib/route";
import type { FlightAirport, FlightViewModel } from "@/types/flight";

const airports: FlightAirport[] = [
  { name: "John F. Kennedy International Airport", city: "New York", iata: "JFK", icao: "KJFK", position: [-73.7781, 40.6413] },
  { name: "London Heathrow Airport", city: "London", iata: "LHR", icao: "EGLL", position: [-0.4543, 51.47] },
  { name: "Los Angeles International Airport", city: "Los Angeles", iata: "LAX", icao: "KLAX", position: [-118.4085, 33.9416] },
  { name: "Tokyo Haneda Airport", city: "Tokyo", iata: "HND", icao: "RJTT", position: [139.7798, 35.5494] },
  { name: "Dubai International Airport", city: "Dubai", iata: "DXB", icao: "OMDB", position: [55.3657, 25.2532] },
  { name: "Sao Paulo Guarulhos International Airport", city: "Sao Paulo", iata: "GRU", icao: "SBGR", position: [-46.4731, -23.4356] },
  { name: "Paris Charles de Gaulle Airport", city: "Paris", iata: "CDG", icao: "LFPG", position: [2.55, 49.0097] },
  { name: "Singapore Changi Airport", city: "Singapore", iata: "SIN", icao: "WSSS", position: [103.9915, 1.3644] },
];

const airlines = ["Delta Air Lines", "British Airways", "United Airlines", "Emirates", "LATAM", "Air France"];

function numberHash(value: string) {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export async function searchMockFlight(query: string): Promise<FlightViewModel> {
  const hash = numberHash(query);
  const departure = airports[hash % airports.length];
  const arrival = airports[(hash + 3) % airports.length];
  const route = buildCurvedRoute(departure.position, arrival.position);
  const now = new Date();
  const progressIndex = Math.min(route.length - 1, Math.max(0, hash % route.length));
  const dep = new Date(now.getTime() - (1 + (hash % 5)) * 60 * 60 * 1000);
  const arr = new Date(now.getTime() + (2 + (hash % 8)) * 60 * 60 * 1000);

  return {
    id: `mock-${query.toUpperCase()}`,
    number: query.toUpperCase() || "DL47",
    callsign: query.toUpperCase().replace(/\s/g, ""),
    airline: airlines[hash % airlines.length],
    aircraft: hash % 2 === 0 ? "Airbus A330" : "Boeing 787",
    status: "En route",
    departure,
    arrival,
    scheduledDeparture: dep.toISOString(),
    scheduledArrival: arr.toISOString(),
    actualDeparture: dep.toISOString(),
    current: {
      position: route[progressIndex],
      altitudeMeters: 9600 + (hash % 1600),
      speedKmh: 760 + (hash % 180),
      bearingDegrees: hash % 360,
      updatedAt: now.toISOString(),
    },
    route,
    source: "mock",
    fetchedAt: now.toISOString(),
  };
}

export async function searchMockFlights(queries: string[]): Promise<FlightViewModel[]> {
  return Promise.all(queries.map((query) => searchMockFlight(query)));
}

export function demoFlightNumbers() {
  return ["DL47", "BA117", "UA900", "EK201", "LA8084", "AF454", "SQ25", "JL43", "AA100", "LH400", "QF12", "TP88"];
}
