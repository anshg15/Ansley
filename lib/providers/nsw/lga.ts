import type { Coordinates } from "@/lib/domain/analysis";
import { fetchWithTimeout } from "@/lib/providers/http";

const NSW_LGA_QUERY_URL = "https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Administrative_Boundaries_Theme/FeatureServer/8/query";

export type LgaProvider = { resolveLga(coordinates: Coordinates): Promise<string | null> };

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }

export class NswLgaClient implements LgaProvider {
  constructor(private readonly fetcher: typeof fetch = fetch, private readonly timeoutMs = 6_000, private readonly endpoint = NSW_LGA_QUERY_URL) {}

  async resolveLga(coordinates: Coordinates): Promise<string | null> {
    const endpoint = new URL(this.endpoint);
    if (endpoint.protocol !== "https:" || endpoint.hostname !== "portal.spatial.nsw.gov.au") {
      throw new Error("LGA lookups must use the official NSW spatial service.");
    }
    const params = new URLSearchParams({
      f: "json",
      geometry: `${coordinates.longitude},${coordinates.latitude}`,
      geometryType: "esriGeometryPoint",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      outFields: "lganame",
      returnGeometry: "false",
      resultRecordCount: "1",
    });
    try {
      const response = await fetchWithTimeout(this.fetcher, `${endpoint}?${params}`, { cache: "no-store" }, this.timeoutMs);
      if (!response.ok) return null;
      const payload: unknown = await response.json();
      if (!isRecord(payload) || !Array.isArray(payload.features) || !isRecord(payload.features[0]) || !isRecord(payload.features[0].attributes)) return null;
      const name = payload.features[0].attributes.lganame;
      return typeof name === "string" && name.trim() ? name.trim() : null;
    } catch {
      return null;
    }
  }
}
