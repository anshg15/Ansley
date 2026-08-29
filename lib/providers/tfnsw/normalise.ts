import type { TransportJourney } from "@/lib/domain/transport-journey";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getPath(value: unknown, path: string[]): unknown {
  return path.reduce<unknown>((current, key) => (isRecord(current) ? current[key] : undefined), value);
}

function firstDefined(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null);
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function minutesFromDuration(value: unknown, numericUnit: "seconds" | "minutes" = "seconds"): number | undefined {
  const numeric = asNumber(value);
  if (numeric !== undefined) return numericUnit === "seconds" ? Math.round(numeric / 60) : Math.round(numeric);
  if (typeof value !== "string") return undefined;

  const isoMatch = /^PT(?:(\d+)H)?(?:(\d+)M)?$/i.exec(value);
  if (isoMatch) return Number(isoMatch[1] ?? 0) * 60 + Number(isoMatch[2] ?? 0);

  const minuteMatch = /(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?/i.exec(value);
  if (minuteMatch && (minuteMatch[1] || minuteMatch[2])) {
    return Number(minuteMatch[1] ?? 0) * 60 + Number(minuteMatch[2] ?? 0);
  }
  return undefined;
}

function stringValue(...values: unknown[]) {
  const value = values.find((candidate) => typeof candidate === "string" && candidate.trim());
  return typeof value === "string" ? value.trim() : undefined;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function journeyCandidates(payload: unknown): UnknownRecord[] {
  const direct = firstDefined(
    getPath(payload, ["journeys"]),
    getPath(payload, ["itdTripRequest", "itdItinerary"]),
    getPath(payload, ["itdTripRequest", "itdTrip"]),
  );
  return asArray(direct).filter(isRecord);
}

function legCandidates(journey: UnknownRecord) {
  return asArray(firstDefined(journey.legs, journey.leg, journey.itdPartialRouteList)).filter(isRecord);
}

function isWalkingLeg(leg: UnknownRecord) {
  const type = stringValue(
    leg.type,
    getPath(leg, ["transportation", "product", "class"]),
    getPath(leg, ["transportation", "product", "name"]),
    getPath(leg, ["transportation", "name"]),
  )?.toLowerCase();
  return type === "walk" || type === "walking" || type === "foot" || type === "footpath";
}

function modeForLeg(leg: UnknownRecord) {
  return stringValue(
    getPath(leg, ["transportation", "product", "name"]),
    getPath(leg, ["transportation", "product", "class"]),
    getPath(leg, ["transportation", "name"]),
    leg.type,
  );
}

function normaliseJourney(journey: UnknownRecord, anchorId: string, alternatives: UnknownRecord[]): TransportJourney {
  const legs = legCandidates(journey);
  const journeyDurationMinutes = journey.durationMinutes === undefined
    ? minutesFromDuration(journey.duration)
    : minutesFromDuration(journey.durationMinutes, "minutes");
  // Current TfNSW live responses can omit a journey-level duration while still
  // providing durations for every leg. Sum those legs instead of discarding a
  // valid journey solely because an optional summary field is absent.
  const durationMinutes = journeyDurationMinutes ?? (() => {
    const total = legs.reduce((minutes, leg) => minutes + (leg.durationMinutes === undefined
      ? (minutesFromDuration(leg.duration) ?? 0)
      : (minutesFromDuration(leg.durationMinutes, "minutes") ?? 0)), 0);
    return total > 0 ? total : undefined;
  })();
  const walkingLegs = legs.filter(isWalkingLeg);
  const walkingMinutes = walkingLegs.reduce(
    (total, leg) => total + (leg.durationMinutes === undefined
      ? (minutesFromDuration(leg.duration) ?? 0)
      : (minutesFromDuration(leg.durationMinutes, "minutes") ?? 0)),
    0,
  );
  const walkingDistanceMetres = walkingLegs.reduce(
    (total, leg) => total + (asNumber(firstDefined(leg.distance, leg.distanceMetres)) ?? 0),
    0,
  );
  const transportLegs = legs.filter((leg) => !isWalkingLeg(leg));
  const modes = [...new Set(transportLegs.map(modeForLeg).filter(Boolean))] as string[];
  const alternateDurations = alternatives
    .map((alternative) => alternative.durationMinutes === undefined
      ? minutesFromDuration(alternative.duration)
      : minutesFromDuration(alternative.durationMinutes, "minutes"))
    .filter((duration): duration is number => duration !== undefined && duration !== durationMinutes);

  if (durationMinutes === undefined) {
    throw new Error("TfNSW returned a journey without a usable duration.");
  }

  return {
    anchorId,
    durationMinutes,
    walkingMinutes,
    ...(walkingDistanceMetres > 0 ? { walkingDistanceMetres } : {}),
    transfers: Math.max(0, transportLegs.length - 1),
    modes,
    departureTime: stringValue(getPath(journey, ["origin", "departureTimeEstimated"]), journey.departureTime),
    arrivalTime: stringValue(getPath(journey, ["destination", "arrivalTimeEstimated"]), journey.arrivalTime),
    ...(alternateDurations.length > 0 ? { alternativeDurationMinutes: Math.min(...alternateDurations) } : {}),
  };
}

export function normaliseTfnswJourney(payload: unknown, anchorId: string): TransportJourney {
  const journeys = journeyCandidates(payload);
  if (journeys.length === 0) {
    throw new Error("TfNSW did not return a journey for this address.");
  }

  return normaliseJourney(journeys[0], anchorId, journeys.slice(1));
}
