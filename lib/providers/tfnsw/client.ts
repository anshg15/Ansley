import type { RepresentativeDeparture, RouteAnalysis } from "@/lib/domain/analysis";
import { normaliseTfnswJourney } from "./normalise";

const TFNSW_API_BASE_URL = "https://api.transport.nsw.gov.au/v1/tp";

type UnknownRecord = Record<string, unknown>;

type TfnswLocation = {
  id: string;
  type: string;
};

export class TfnswProviderError extends Error {}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function locationCandidates(payload: unknown): UnknownRecord[] {
  if (!isRecord(payload)) return [];
  const direct = payload.locations ?? payload.stopFinder ?? payload.itdOdv;
  return asArray(direct).filter(isRecord);
}

function extractLocation(payload: unknown): TfnswLocation {
  const location = locationCandidates(payload)[0];
  if (!location) throw new TfnswProviderError("TfNSW could not find that address.");

  const id = location.id ?? location.name ?? location.object;
  if (typeof id !== "string" && typeof id !== "number") {
    throw new TfnswProviderError("TfNSW returned a location without an identifier.");
  }
  const rawType = location.type;
  // Stop Finder returns address-specific types such as `singlehouse`, while
  // Trip Planner only accepts its generic `any` selector for those IDs.
  // Preserve the two resolved types that Trip Planner accepts directly.
  const type = rawType === "stop" || rawType === "poi" ? rawType : "any";
  return { id: String(id), type };
}

function apiKey() {
  const key = process.env.TFNSW_API_KEY;
  if (!key) throw new TfnswProviderError("Live transport analysis is not configured yet.");
  return key;
}

function sydneyTripPlannerDateTime(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );

  return { date: `${values.year}${values.month}${values.day}`, time: `${values.hour}${values.minute}` };
}

export class TfnswClient {
  private readonly locations = new Map<string, Promise<TfnswLocation>>();

  constructor(
    private readonly fetcher: typeof fetch = fetch,
    private readonly baseUrl = TFNSW_API_BASE_URL,
  ) {}

  async analyseJourney(originAddress: string, destinationAddress: string, anchorId: string): Promise<RouteAnalysis> {
    return this.analyseJourneyAt(originAddress, destinationAddress, anchorId);
  }

  async analyseJourneyAt(
    originAddress: string,
    destinationAddress: string,
    anchorId: string,
    departure?: RepresentativeDeparture,
  ): Promise<RouteAnalysis> {
    const [origin, destination] = await Promise.all([
      this.findLocation(originAddress),
      this.findLocation(destinationAddress),
    ]);

    const tripDeparture = departure
      ? { date: departure.date.replaceAll("-", ""), time: departure.time.replace(":", "") }
      : sydneyTripPlannerDateTime();
    const params = new URLSearchParams({
      outputFormat: "rapidJSON",
      coordOutputFormat: "EPSG:4326",
      depArrMacro: "dep",
      itdDate: tripDeparture.date,
      itdTime: tripDeparture.time,
      type_origin: origin.type,
      name_origin: origin.id,
      type_destination: destination.type,
      name_destination: destination.id,
      TfNSWTR: "true",
    });
    const payload = await this.getJson(`/trip?${params.toString()}`);
    return normaliseTfnswJourney(payload, anchorId);
  }

  private async findLocation(address: string) {
    const existing = this.locations.get(address);
    if (existing) return existing;

    const location = this.requestLocation(address);
    this.locations.set(address, location);
    return location;
  }

  private async requestLocation(address: string) {
    const params = new URLSearchParams({
      outputFormat: "rapidJSON",
      type_sf: "any",
      name_sf: address,
      coordOutputFormat: "EPSG:4326",
      anyMaxSizeHitList: "1",
      TfNSWSF: "true",
    });
    return extractLocation(await this.getJson(`/stop_finder?${params.toString()}`));
  }

  private async getJson(path: string): Promise<unknown> {
    const key = apiKey();
    let response: Response;
    try {
      response = await this.fetcher(`${this.baseUrl}${path}`, {
        headers: { Authorization: `apikey ${key}`, Accept: "application/json" },
        cache: "no-store",
      });
    } catch {
      throw new TfnswProviderError("Live transport analysis is temporarily unavailable.");
    }

    if (!response.ok) {
      throw new TfnswProviderError(`Live transport analysis is temporarily unavailable (TfNSW ${response.status}).`);
    }

    try {
      return await response.json();
    } catch {
      throw new TfnswProviderError("TfNSW returned an unreadable response.");
    }
  }
}
