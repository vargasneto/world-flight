export type LngLat = [number, number];

export type FlightAirport = {
  iata?: string;
  icao?: string;
  name: string;
  city?: string;
  position: LngLat;
};

export type FlightPosition = {
  position: LngLat;
  altitudeMeters?: number;
  speedKmh?: number;
  bearingDegrees?: number;
  updatedAt?: string;
};

export type FlightViewModel = {
  id: string;
  number: string;
  callsign?: string;
  airline?: string;
  aircraft?: string;
  status: string;
  departure: FlightAirport;
  arrival: FlightAirport;
  scheduledDeparture?: string;
  scheduledArrival?: string;
  actualDeparture?: string;
  actualArrival?: string;
  current?: FlightPosition;
  route: LngLat[];
  source: "mock" | "aerodatabox";
  fetchedAt: string;
};

export type FlightSearchResponse =
  | {
      ok: true;
      flights: FlightViewModel[];
      selectedFlightId?: string;
      cached: boolean;
      warnings?: string[];
    }
  | {
      ok: false;
      message: string;
      code: "BAD_REQUEST" | "NOT_FOUND" | "PROVIDER_ERROR" | "RATE_LIMITED" | "FORBIDDEN";
    };
