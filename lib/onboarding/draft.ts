import type { AnalysisRequest, AnchorCategory } from "@/lib/domain/analysis";
import type { UserPreset } from "@/lib/domain/user-profile";

export type OnboardingDraft = {
  propertyAddress: string;
  preset: UserPreset;
  anchors: AnchorDraft[];
  timeLens: boolean;
};
export type AnchorDraft = { id: string; name: string; address: string; category: AnchorCategory; visitsPerWeek: string | number; maxTravelMinutes: string | number };

export type OnboardingField =
  | "propertyAddress"
  | "anchorName"
  | "anchorAddress"
  | "category"
  | "visitsPerWeek"
  | "maxTravelMinutes";

export type OnboardingErrors = Record<string, string>;

const anchorCategories = new Set<AnchorCategory>([
  "work",
  "education",
  "health",
  "social",
  "exercise",
  "other",
]);

export class OnboardingDraftError extends Error {
  constructor(public readonly fieldErrors: OnboardingErrors) {
    super("Please correct the highlighted onboarding fields.");
  }
}

export function validatePropertyAddress(value: string) {
  return value.trim() ? undefined : "Enter the rental address you are considering.";
}
export function createAnchor(id: string): AnchorDraft { return { id, name: "", address: "", category: "work", visitsPerWeek: "3", maxTravelMinutes: "45" }; }

function positiveNumber(value: string | number, label: string) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : `${label} must be greater than zero.`;
}

export function buildAnalysisRequest(draft: OnboardingDraft): AnalysisRequest {
  const errors: OnboardingErrors = {};
  const propertyAddress = draft.propertyAddress.trim();
  const propertyError = validatePropertyAddress(propertyAddress);
  if (propertyError) errors.propertyAddress = propertyError;
  if (draft.anchors.length < 1 || draft.anchors.length > 4) errors.anchors = "Add between one and four regular destinations.";
  const seen = new Set<string>();
  const anchors = draft.anchors.map((anchor, index) => {
    const prefix = `anchors.${index}`; const name = anchor.name.trim(); const address = anchor.address.trim(); const visits = positiveNumber(anchor.visitsPerWeek, "Visits per week"); const maximum = positiveNumber(anchor.maxTravelMinutes, "Maximum travel time");
    if (!anchor.id || seen.has(anchor.id)) errors[`${prefix}.id`] = "Each destination needs a unique identifier."; seen.add(anchor.id);
    if (!name) errors[`${prefix}.name`] = "Give this regular destination a name.";
    if (!address) errors[`${prefix}.address`] = "Enter the destination address.";
    if (!anchorCategories.has(anchor.category)) errors[`${prefix}.category`] = "Choose a supported destination category.";
    if (typeof visits === "string") errors[`${prefix}.visitsPerWeek`] = visits;
    if (typeof maximum === "string") errors[`${prefix}.maxTravelMinutes`] = maximum;
    return { id: anchor.id, name, address, category: anchor.category, visitsPerWeek: visits as number, maxTravelMinutes: maximum as number };
  });

  const fieldErrors = Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message !== undefined),
  ) as OnboardingErrors;

  if (Object.keys(fieldErrors).length > 0) {
    throw new OnboardingDraftError(fieldErrors);
  }

  const selected = [...anchors].sort((left, right) => right.visitsPerWeek - left.visitsPerWeek).slice(0, 2).map((anchor) => anchor.id);
  return { property: { address: propertyAddress, source: "manual" }, anchors, userProfile: { preset: draft.preset }, preferences: [], options: draft.timeLens ? { timeLens: { anchorIds: selected, periodIds: ["weekday-morning", "weekday-evening"] } } : {} };
}
