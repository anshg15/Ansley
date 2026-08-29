import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAnalysisRequest,
  createAnchor,
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

test("reports invalid and duplicate multi-anchor values without producing a request", () => {
  assert.throws(
    () => buildAnalysisRequest({
      propertyAddress: "42 King Street, Newtown NSW",
      preset: "custom", timeLens: false,
      anchors: [{ ...createAnchor("same"), visitsPerWeek: "0" }, { ...createAnchor("same"), name: "Work", address: "CBD", maxTravelMinutes: "not-a-number" }],
    }),
    (error) => {
      assert.ok(error instanceof OnboardingDraftError);
      assert.deepEqual(error.fieldErrors, {
        "anchors.0.name": "Give this regular destination a name.",
        "anchors.0.address": "Enter the destination address.",
        "anchors.0.visitsPerWeek": "Visits per week must be greater than zero.",
        "anchors.1.id": "Each destination needs a unique identifier.",
        "anchors.1.maxTravelMinutes": "Maximum travel time must be greater than zero.",
      });
      return true;
    },
  );
});

test("builds one to four canonical anchors, preserving preset and TimeLens selection", () => {
  const anchors = Array.from({ length: 3 }, (_, index) => ({ ...createAnchor(`anchor-${index}`), name: ` Place ${index} `, address: ` Address ${index} ` }));
  assert.deepEqual(
    buildAnalysisRequest({
      propertyAddress: " 42 King Street, Newtown NSW ",
      preset: "student", timeLens: true, anchors,
    }),
    {
      property: {
        address: "42 King Street, Newtown NSW",
        source: "manual",
      },
      anchors: anchors.map((anchor) => ({ ...anchor, name: anchor.name.trim(), address: anchor.address.trim(), visitsPerWeek: 3, maxTravelMinutes: 45 })),
      userProfile: { preset: "student" }, preferences: [], options: { timeLens: { anchorIds: ["anchor-0", "anchor-1"], periodIds: ["weekday-morning", "weekday-evening"] } },
    },
  );
});
