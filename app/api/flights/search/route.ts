import { NextResponse } from "next/server";
import { FlightProviderError, searchFlights } from "@/server/flight-provider";
import type { FlightSearchResponse } from "@/types/flight";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json<FlightSearchResponse>(
      { ok: false, code: "BAD_REQUEST", message: "Informe um numero de voo." },
      { status: 400 },
    );
  }

  try {
    const result = await searchFlights(query);
    return NextResponse.json<FlightSearchResponse>({ ok: true, ...result });
  } catch (error) {
    if (error instanceof FlightProviderError) {
      const status =
        error.code === "NOT_FOUND"
          ? 404
          : error.code === "RATE_LIMITED"
            ? 429
            : error.code === "FORBIDDEN"
              ? 403
              : 502;
      return NextResponse.json<FlightSearchResponse>(
        { ok: false, code: error.code, message: error.message },
        { status },
      );
    }

    return NextResponse.json<FlightSearchResponse>(
      { ok: false, code: "PROVIDER_ERROR", message: "Erro inesperado ao buscar voo." },
      { status: 500 },
    );
  }
}
