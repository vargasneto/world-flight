import along from "@turf/along";
import bearing from "@turf/bearing";
import destination from "@turf/destination";
import distance from "@turf/distance";
import { lineString, point } from "@turf/helpers";
import type { LngLat } from "@/types/flight";

export function buildCurvedRoute(from: LngLat, to: LngLat, steps = 96): LngLat[] {
  const direct = distance(point(from), point(to), { units: "kilometers" });
  const initialBearing = bearing(point(from), point(to));
  const midpoint = along(lineString([from, to]), direct / 2, { units: "kilometers" }).geometry
    .coordinates as LngLat;
  const curveHeight = Math.min(Math.max(direct * 0.12, 120), 1100);
  const control = destination(point(midpoint), curveHeight, initialBearing + 90, {
    units: "kilometers",
  }).geometry.coordinates as LngLat;

  const route: LngLat[] = [];

  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    const oneMinusT = 1 - t;
    const lng = oneMinusT * oneMinusT * from[0] + 2 * oneMinusT * t * control[0] + t * t * to[0];
    const lat = oneMinusT * oneMinusT * from[1] + 2 * oneMinusT * t * control[1] + t * t * to[1];
    route.push([lng, lat]);
  }

  return route;
}

export function interpolateRoute(route: LngLat[], progress: number) {
  if (route.length === 0) return { position: [0, 0] as LngLat, bearing: 0 };
  if (route.length === 1) return { position: route[0], bearing: 0 };

  const clamped = Math.max(0, Math.min(1, progress));
  const rawIndex = clamped * (route.length - 1);
  const index = Math.floor(rawIndex);
  const nextIndex = Math.min(index + 1, route.length - 1);
  const localProgress = rawIndex - index;
  const current = route[index];
  const next = route[nextIndex];

  const position: LngLat = [
    current[0] + (next[0] - current[0]) * localProgress,
    current[1] + (next[1] - current[1]) * localProgress,
  ];

  return {
    position,
    bearing: bearing(point(current), point(next)),
  };
}
