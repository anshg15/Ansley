import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAnalysisRequest,
  OnboardingDraftError,
  validatePropertyAddress,
} from "./draft";

test("requires a non-empty property address", () => {
  assert.equal(
    validatePropertyAddress("   "),
    "Enter the rental address you are considering.",
  );
  assert.equal(validatePropertyAddress("42 King Street, Newtown NSW"), undefined);
});

test("reports invalid numeric routine fields without producing a request", () => {
  assert.throws(
    () => buildAnalysisRequest({
      propertyAddress: "42 King Street, Newtown NSW",
      anchorName: "University",
      anchorAddress: "University of Sydney, Camperdown NSW",
      category: "education",
      visitsPerWeek: "0",
      maxTravelMinutes: "not-a-number",
    }),
    (error) => {
      assert.ok(error instanceof OnboardingDraftError);
      assert.deepEqual(error.fieldErrors, {
        visitsPerWeek: "Visits per week must be greater than zero.",
        maxTravelMinutes: "Maximum travel time must be greater than zero.",
      });
      return true;
    },
  );
});

test("builds a canonical AnalysisRequest from trimmed onboarding values", () => {
  assert.deepEqual(
    buildAnalysisRequest({
      propertyAddress: " 42 King Street, Newtown NSW ",
      anchorName: " University ",
      anchorAddress: " University of Sydney, Camperdown NSW ",
      category: "education",
      visitsPerWeek: "4",
      maxTravelMinutes: "45",
    }),
    {
      property: {
        address: "42 King Street, Newtown NSW",
        source: "manual",
      },
      anchors: [{
        id: "primary-anchor",
        name: "University",
        address: "University of Sydney, Camperdown NSW",
        category: "education",
        visitsPerWeek: 4,
        maxTravelMinutes: 45,
      }],
    },
  );
});
