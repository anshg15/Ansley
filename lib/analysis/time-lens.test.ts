import assert from "node:assert/strict";
import test from "node:test";
import { analyseTimeLens, representativeDepartures } from "./time-lens";
import type { AnalysedAnchor, RouteAnalysis } from "@/lib/domain/analysis";

const anchors: AnalysedAnchor[] = [
  {
    id: "uni", name: "University", address: "USYD", visitsPerWeek: 4, maxTravelMinutes: 45, category: "education",
    route: { anchorId: "uni", durationMinutes: 33, walkingMinutes: 7, transfers: 0, modes: ["Train"] },
    weeklyTravelMinutes: 264, withinTravelTolerance: true,
  },
  {
    id: "work", name: "Work", address: "Sydney CBD", visitsPerWeek: 3, maxTravelMinutes: 45, category: "work",
    route: { anchorId: "work", durationMinutes: 35, walkingMinutes: 8, transfers: 1, modes: ["Train", "Bus"] },
    weeklyTravelMinutes: 210, withinTravelTolerance: true,
  },
];

test("uses two capped representative periods for selected anchors", async () => {
  let activeRequests = 0;
  let maximumActiveRequests = 0;
  const calls: string[] = [];
  const provider = {
    async analyseJourney(): Promise<RouteAnalysis> {
      throw new Error("not used");
    },
    async analyseJourneyAt(_origin: string, _destination: string, anchorId: string, departure: { time: string }): Promise<RouteAnalysis> {
      activeRequests += 1;
      maximumActiveRequests = Math.max(maximumActiveRequests, activeRequests);
      calls.push(`${anchorId}:${departure.time}`);
      await new Promise((resolve) => setTimeout(resolve, 5));
      activeRequests -= 1;
      return {
        anchorId,
        durationMinutes: departure.time === "08:00" ? 31 : 39,
        walkingMinutes: 7,
        transfers: 0,
        modes: ["Train"],
      };
    },
  };

  const results = await analyseTimeLens(
    "1 King Street, Newtown NSW",
    anchors,
    { timeLens: { anchorIds: ["uni", "work"] } },
    provider,
  );

  assert.equal(calls.length, 4);
  assert.equal(maximumActiveRequests, 2);
  assert.deepEqual(results.map((result) => result.variationMinutes), [8, 8]);
  assert.deepEqual(results.map((result) => result.status), ["available", "available"]);
});

test("uses the next Sydney weekday and two fixed representative times", () => {
  const departures = representativeDepartures({ timeLens: true }, new Date("2026-08-29T12:00:00Z"));

  assert.deepEqual(departures.map(({ departure }) => departure), [
    { date: "2026-08-31", time: "08:00", timeZone: "Australia/Sydney" },
    { date: "2026-08-31", time: "18:00", timeZone: "Australia/Sydney" },
  ]);
});
