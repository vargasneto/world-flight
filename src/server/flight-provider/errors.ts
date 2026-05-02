export class FlightProviderError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "RATE_LIMITED" | "PROVIDER_ERROR" | "FORBIDDEN",
  ) {
    super(message);
  }
}
