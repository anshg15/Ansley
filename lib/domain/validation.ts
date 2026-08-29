import type { AnalysisRequest, Anchor, AnchorCategory, Coordinates, PropertyProfile } from "./analysis";

const anchorCategories = new Set<AnchorCategory>([
  "work",
  "education",
  "health",
  "social",
  "exercise",
  "other",
]);

export class RequestValidationError extends Error {}

function asNonEmptyString(value: unknown, label: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new RequestValidationError(`${label} is required.`);
  }

  return value.trim();
}

function asPositiveNumber(value: unknown, label: string) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new RequestValidationError(`${label} must be a positive number.`);
  }

  return value;
}

function parseProperty(value: unknown): PropertyProfile {
  if (!value || typeof value !== "object") {
    throw new RequestValidationError("property is required.");
  }

  const property = value as Record<string, unknown>;
  const coordinates = parseCoordinates(property.coordinates);
  const rentPerWeek = property.rentPerWeek === undefined
    ? undefined
    : asPositiveNumber(property.rentPerWeek, "Rent per week");
  const dwellingType = property.dwellingType === undefined
    ? undefined
    : asNonEmptyString(property.dwellingType, "Dwelling type");

  return {
    address: asNonEmptyString(property.address, "Property address"),
    ...(rentPerWeek === undefined ? {} : { rentPerWeek }),
    ...(coordinates === undefined ? {} : { coordinates }),
    ...(dwellingType === undefined ? {} : { dwellingType }),
  };
}

function parseCoordinates(value: unknown): Coordinates | undefined {
  if (value === undefined) return undefined;
  if (!value || typeof value !== "object") {
    throw new RequestValidationError("Property coordinates must contain latitude and longitude.");
  }

  const coordinates = value as Record<string, unknown>;
  const latitude = asPositiveOrNegativeNumber(coordinates.latitude, "Property latitude");
  const longitude = asPositiveOrNegativeNumber(coordinates.longitude, "Property longitude");
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new RequestValidationError("Property coordinates are outside valid geographic bounds.");
  }
  return { latitude, longitude };
}

function asPositiveOrNegativeNumber(value: unknown, label: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new RequestValidationError(`${label} must be a number.`);
  }
  return value;
}

function parseAnchor(value: unknown, index: number): Anchor {
  if (!value || typeof value !== "object") {
    throw new RequestValidationError(`Anchor ${index + 1} is invalid.`);
  }

  const anchor = value as Record<string, unknown>;
  const category = anchor.category ?? "other";
  if (typeof category !== "string" || !anchorCategories.has(category as AnchorCategory)) {
    throw new RequestValidationError(`Anchor ${index + 1} has an unsupported category.`);
  }

  return {
    id: asNonEmptyString(anchor.id, `Anchor ${index + 1} id`),
    name: asNonEmptyString(anchor.name, `Anchor ${index + 1} name`),
    address: asNonEmptyString(anchor.address, `Anchor ${index + 1} address`),
    visitsPerWeek: asPositiveNumber(anchor.visitsPerWeek, `Anchor ${index + 1} visits per week`),
    maxTravelMinutes: asPositiveNumber(anchor.maxTravelMinutes, `Anchor ${index + 1} maximum travel time`),
    category: category as AnchorCategory,
  };
}

export function parseAnalysisRequest(value: unknown): AnalysisRequest {
  if (!value || typeof value !== "object") {
    throw new RequestValidationError("A JSON analysis request is required.");
  }

  const request = value as Record<string, unknown>;
  if (!Array.isArray(request.anchors) || request.anchors.length === 0) {
    throw new RequestValidationError("At least one personal anchor is required.");
  }
  if (request.anchors.length > 4) {
    throw new RequestValidationError("A maximum of four anchors can be analysed at once.");
  }

  const anchors = request.anchors.map(parseAnchor);
  if (new Set(anchors.map((anchor) => anchor.id)).size !== anchors.length) {
    throw new RequestValidationError("Each anchor must have a unique id.");
  }

  return { property: parseProperty(request.property), anchors };
}
