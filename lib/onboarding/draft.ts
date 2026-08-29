import type { AnalysisRequest, AnchorCategory } from "@/lib/domain/analysis";

export type OnboardingDraft = {
  propertyAddress: string;
  anchorName: string;
  anchorAddress: string;
  category: AnchorCategory;
  visitsPerWeek: string | number;
  maxTravelMinutes: string | number;
};

export type OnboardingField =
  | "propertyAddress"
  | "anchorName"
  | "anchorAddress"
  | "category"
  | "visitsPerWeek"
  | "maxTravelMinutes";

export type OnboardingErrors = Partial<Record<OnboardingField, string>>;

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

function positiveNumber(value: string | number, label: string) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : `${label} must be greater than zero.`;
}

export function buildAnalysisRequest(draft: OnboardingDraft): AnalysisRequest {
  const errors: OnboardingErrors = {};
  const propertyAddress = draft.propertyAddress.trim();
  const anchorName = draft.anchorName.trim();
  const anchorAddress = draft.anchorAddress.trim();
  const visitsPerWeek = positiveNumber(draft.visitsPerWeek, "Visits per week");
  const maxTravelMinutes = positiveNumber(draft.maxTravelMinutes, "Maximum travel time");

  errors.propertyAddress = validatePropertyAddress(propertyAddress);
  if (!anchorName) errors.anchorName = "Give this regular destination a name.";
  if (!anchorAddress) errors.anchorAddress = "Enter the destination address.";
  if (!anchorCategories.has(draft.category)) errors.category = "Choose a supported destination category.";
  if (typeof visitsPerWeek === "string") errors.visitsPerWeek = visitsPerWeek;
  if (typeof maxTravelMinutes === "string") errors.maxTravelMinutes = maxTravelMinutes;

  const fieldErrors = Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message !== undefined),
  ) as OnboardingErrors;

  if (Object.keys(fieldErrors).length > 0) {
    throw new OnboardingDraftError(fieldErrors);
  }

  return {
    property: {
      address: propertyAddress,
      source: "manual",
    },
    anchors: [
      {
        id: "primary-anchor",
        name: anchorName,
        address: anchorAddress,
        category: draft.category,
        visitsPerWeek: visitsPerWeek as number,
        maxTravelMinutes: maxTravelMinutes as number,
      },
    ],
  };
}
