import assert from "node:assert/strict";
import test from "node:test";
import { analyseAddressTruth } from "./analyse";
import { normaliseTfnswJourney } from "@/lib/providers/tfnsw/normalise";
import journeyFixture from "@/fixtures/tfnsw-journey.json";

test("returns a partial report when an individual anchor fails", async () => {
  const report = await analyseAddressTruth(
    {
      property: { address: "1 King Street, Newtown NSW", source: "manual", },
      userProfile: {
        preset: "custom",
      },
      anchors: [
        { id: "uni", name: "University", address: "USYD", visitsPerWeek: 4, maxTravelMinutes: 35, category: "education" },
        { id: "work", name: "Work", address: "CBD", visitsPerWeek: 3, maxTravelMinutes: 30, category: "work" },
      ],
      preferences: [],
    },
    {
      async analyseJourney(_origin, _destination, anchorId) {
        if (anchorId === "work") throw new Error("No route found.");
        return normaliseTfnswJourney(journeyFixture, anchorId);
      },
    },
  );

  assert.equal(report.routes.length, 1);
  assert.equal(report.failedAnchors.length, 1);
  assert.equal(report.summary.weeklyTravelMinutes, 264);
  assert.equal(report.routineFit?.percentage, 100);
  assert.equal(report.routes[0].withinTolerance, true);
});
