import assert from "node:assert/strict";
import test from "node:test";
import { buildSafetyContext } from "./safety-context";

test("combines source-labelled official area data, property facts, and routine descriptions without a safety score", async () => {
  const context = await buildSafetyContext(
    {
      address: "1 King Street, Newtown NSW",
      localGovernmentArea: "Inner West",
      securityFeatures: [
        { feature: "controlled-entry", source: "listing" },
        { feature: "intercom", source: "user-confirmed" },
      ],
    },
    [{
      id: "work",
      name: "Work",
      address: "Sydney CBD",
      visitsPerWeek: 3,
      maxTravelMinutes: 35,
      category: "work",
      weeklyTravelMinutes: 120,
      withinTravelTolerance: true,
      route: { anchorId: "work", durationMinutes: 40, walkingMinutes: 9, transfers: 1, modes: ["Train"] },
    }],
    {
      async getAreaContext(localGovernmentArea) {
        return {
          localGovernmentArea,
          sourceName: "NSW BOCSAR local area rankings",
          sourceUrl: "https://bocsar.nsw.gov.au/example",
          observations: [{ offence: "Break and enter dwelling", ratePer100k: 125.4, dataPeriod: "Apr 2025–Mar 2026" }],
          retrievedAt: "2026-08-29T00:00:00.000Z",
          freshness: "current",
        };
      },
    },
  );

  assert.equal(context.area.status, "available");
  assert.equal(context.area.observations[0].source.label, "official-data");
  assert.equal(context.area.observations[0].source.freshness, "current");
  assert.equal(context.property[0].source.label, "listing-derived");
  assert.equal(context.property[1].source.label, "user-confirmed");
  assert.equal(context.routine[0].source.label, "addresstruth-heuristic");
  assert.match(context.disclaimer, /do not describe this dwelling/i);
  assert.equal(JSON.stringify(context).includes("score"), false);
});

test("keeps source-labelled property and routine context when official area data is unavailable", async () => {
  const context = await buildSafetyContext(
    { address: "1 King Street, Newtown NSW", securityFeatures: [{ feature: "upper-floor", source: "listing" }] },
    [],
  );

  assert.equal(context.area.status, "unavailable");
  assert.equal(context.property.length, 1);
  assert.equal(context.routine.length, 0);
  assert.match(context.area.message ?? "", /not been enabled/i);
});

test("uses a supplied LGA before coordinate lookup and resolves coordinates when no override exists", async () => {
  let resolved = 0;
  const provider = {
    async getAreaContext(localGovernmentArea: string) {
      return { localGovernmentArea, sourceName: "BOCSAR", sourceUrl: "https://bocsar.nsw.gov.au", observations: [], retrievedAt: "2026-08-29T00:00:00.000Z", freshness: "current" as const };
    },
  };
  const resolver = { async resolveLga() { resolved += 1; return "Inner West"; } };
  const manual = await buildSafetyContext({ address: "1 King Street", localGovernmentArea: "Ryde", coordinates: { latitude: -33.8, longitude: 151.1 } }, [], provider, resolver);
  assert.equal(manual.area.localGovernmentArea, "Ryde");
  assert.equal(resolved, 0);
  const inferred = await buildSafetyContext({ address: "1 King Street", coordinates: { latitude: -33.8, longitude: 151.1 } }, [], provider, resolver);
  assert.equal(inferred.area.localGovernmentArea, "Inner West");
  assert.equal(resolved, 1);
});
