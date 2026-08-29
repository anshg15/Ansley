import type {
  AnalysisOptions,
  AnalysisRequest,
  Anchor,
  AnchorCategory,
  Coordinates,
  PropertyProfile,
  PropertySecurityFeature,
  TimeLensPeriodId,
} from "./analysis";

const anchorCategories = new Set<AnchorCategory>([
  "work",
  "education",
  "health",
  "social",
  "exercise",
  "other",
]);
const timeLensPeriodIds = new Set<TimeLensPeriodId>(["weekday-morning", "weekday-evening"]);

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
  const localGovernmentArea = property.localGovernmentArea === undefined
    ? undefined
    : asNonEmptyString(property.localGovernmentArea, "Local government area");
  const securityFeatures = parseSecurityFeatures(property.securityFeatures);

  return {
    address: asNonEmptyString(property.address, "Property address"),
    ...(rentPerWeek === undefined ? {} : { rentPerWeek }),
    ...(coordinates === undefined ? {} : { coordinates }),
    ...(dwellingType === undefined ? {} : { dwellingType }),
    ...(localGovernmentArea === undefined ? {} : { localGovernmentArea }),
    ...(securityFeatures === undefined ? {} : { securityFeatures }),
  };
}

const securityFeatureNames = new Set<PropertySecurityFeature["feature"]>([
  "controlled-entry",
  "intercom",
  "secure-parking",
  "upper-floor",
  "street-level-access",
]);
const propertyFactSources = new Set<PropertySecurityFeature["source"]>(["listing", "user-confirmed"]);

function parseSecurityFeatures(value: unknown): PropertySecurityFeature[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > 5) {
    throw new RequestValidationError("Security features must contain at most five sourced facts.");
  }

  const features = value.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new RequestValidationError(`Security feature ${index + 1} is invalid.`);
    }
    const feature = item as Record<string, unknown>;
    if (typeof feature.feature !== "string" || !securityFeatureNames.has(feature.feature as PropertySecurityFeature["feature"])) {
      throw new RequestValidationError(`Security feature ${index + 1} is unsupported.`);
    }
    if (typeof feature.source !== "string" || !propertyFactSources.has(feature.source as PropertySecurityFeature["source"])) {
      throw new RequestValidationError(`Security feature ${index + 1} must identify listing or user-confirmed evidence.`);
    }
    return { feature: feature.feature as PropertySecurityFeature["feature"], source: feature.source as PropertySecurityFeature["source"] };
  });

  if (new Set(features.map((feature) => feature.feature)).size !== features.length) {
    throw new RequestValidationError("Security features must not contain duplicates.");
  }
  return features;
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

  return { property: parseProperty(request.property), anchors, ...(request.options === undefined ? {} : { options: parseOptions(request.options, anchors) }) };
}

function parseOptions(value: unknown, anchors: Anchor[]): AnalysisOptions {
  if (!value || typeof value !== "object") {
    throw new RequestValidationError("Analysis options must be an object.");
  }

  const options = value as Record<string, unknown>;
  if (options.timeLens === undefined) return {};
  if (typeof options.timeLens === "boolean") return { timeLens: options.timeLens };
  if (!options.timeLens || typeof options.timeLens !== "object") {
    throw new RequestValidationError("timeLens must be a boolean or configuration object.");
  }

  const timeLens = options.timeLens as Record<string, unknown>;
  const anchorIds = parseStringList(timeLens.anchorIds, "TimeLens anchor ids", 2);
  const periodIds = parseStringList(timeLens.periodIds, "TimeLens period ids", 2) as TimeLensPeriodId[] | undefined;
  if (anchorIds && anchorIds.some((id) => !anchors.some((anchor) => anchor.id === id))) {
    throw new RequestValidationError("TimeLens can only analyse anchors included in this request.");
  }
  if (periodIds && periodIds.some((id) => !timeLensPeriodIds.has(id))) {
    throw new RequestValidationError("TimeLens contains an unsupported representative period.");
  }

  return { timeLens: { ...(anchorIds ? { anchorIds } : {}), ...(periodIds ? { periodIds } : {}) } };
}

function parseStringList(value: unknown, label: string, maxLength: number): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length === 0 || value.length > maxLength || value.some((item) => typeof item !== "string" || !item.trim())) {
    throw new RequestValidationError(`${label} must contain between one and ${maxLength} values.`);
  }
  const values = value.map((item) => (item as string).trim());
  if (new Set(values).size !== values.length) {
    throw new RequestValidationError(`${label} must not contain duplicates.`);
  }
  return values;
}
