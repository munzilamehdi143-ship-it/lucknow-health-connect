import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  originLat: z.number(),
  originLng: z.number(),
  destLat: z.number(),
  destLng: z.number(),
});

/**
 * Real driving distance + duration from Google Routes API (via the connector
 * gateway). Never fabricates a value: returns null when the route is unknown.
 */
export const computeTravel = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const mapsKey = process.env["GOOGLE_MAPS_API_KEY"];
    if (!lovableKey || !mapsKey) return { distanceKm: null, durationMin: null };

    const res = await fetch(
      "https://connector-gateway.lovable.dev/google_maps/routes/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": mapsKey,
          "Content-Type": "application/json",
          "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: { latitude: data.originLat, longitude: data.originLng },
            },
          },
          destination: {
            location: { latLng: { latitude: data.destLat, longitude: data.destLng } },
          },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_AWARE",
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      console.error(`Routes API failed [${res.status}]: ${body}`);
      return { distanceKm: null, durationMin: null };
    }

    const json = (await res.json()) as {
      routes?: Array<{ distanceMeters?: number; duration?: string }>;
    };
    const route = json.routes?.[0];
    if (!route?.distanceMeters || !route.duration) {
      return { distanceKm: null, durationMin: null };
    }
    return {
      distanceKm: Math.round((route.distanceMeters / 1000) * 10) / 10,
      durationMin: Math.round(parseInt(route.duration.replace("s", ""), 10) / 60),
    };
  });