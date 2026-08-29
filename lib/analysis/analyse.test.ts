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

test("adds TimeLens and ShadowCommute results to the same report contract", async () => {
  const representativeCalls: string[] = [];
  const report = await analyseAddressTruth(
    {
      property: { address: "1 King Street, Newtown NSW" },
      anchors: [
        { id: "uni", name: "University", address: "USYD", visitsPerWeek: 4, maxTravelMinutes: 45, category: "education" },
        { id: "work", name: "Work", address: "CBD", visitsPerWeek: 3, maxTravelMinutes: 30, category: "work" },
      ],
      options: { timeLens: true },
    },
    {
      async analyseJourney(_origin, _destination, anchorId) {
        return {
          anchorId,
          durationMinutes: anchorId === "uni" ? 33 : 36,
          walkingMinutes: 12,
          transfers: 1,
          modes: ["Train", "Bus"],
          alternativeDurationMinutes: 50,
        };
      },
      async analyseJourneyAt(_origin, _destination, anchorId, departure) {
        representativeCalls.push(`${anchorId}:${departure.time}`);
        return {
          anchorId,
          durationMinutes: departure.time === "08:00" ? 31 : 39,
          walkingMinutes: 12,
          transfers: 1,
          modes: ["Train", "Bus"],
        };
      },
    },
  );

  assert.equal(representativeCalls.length, 4);
  assert.equal(report.modules.timeLens.status, "available");
  assert.deepEqual(report.timeLens.map((result) => result.variationMinutes), [8, 8]);
  assert.equal(report.modules.shadowCommute.status, "available");
  assert.deepEqual(report.shadowCommutes.map((result) => result.level), ["medium", "medium"]);
  assert.deepEqual(report.shadowCommutes[0].reasons, ["1 transfer", "12 min walking", "alternative route +17 min"]);
});

test("falls back to the primary route when a representative-time request fails", async () => {
  const report = await analyseAddressTruth(
    {
      property: { address: "1 King Street, Newtown NSW" },
      anchors: [{ id: "uni", name: "University", address: "USYD", visitsPerWeek: 4, maxTravelMinutes: 45, category: "education" }],
      options: { timeLens: true },
    },
    {
      async analyseJourney(_origin, _destination, anchorId) {
        return { anchorId, durationMinutes: 33, walkingMinutes: 7, transfers: 0, modes: ["Train"] };
      },
      async analyseJourneyAt() {
        throw new Error("TfNSW timed out");
      },
    },
  );

  assert.equal(report.anchors.length, 1);
  assert.equal(report.timeLens[0].status, "unavailable");
  assert.equal(report.modules.timeLens.status, "unavailable");
  assert.match(report.timeLens[0].message ?? "", /showing the primary route only/);
});
