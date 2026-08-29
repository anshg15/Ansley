import assert from "node:assert/strict";
import test from "node:test";
import { analyseShadowCommute } from "./shadow-commute";
import type { AnalysedAnchor } from "@/lib/domain/analysis";

function anchorWithRoute(overrides: Partial<AnalysedAnchor["route"]> = {}): AnalysedAnchor {
  return {
    id: "work", name: "Work", address: "Sydney CBD", visitsPerWeek: 3, maxTravelMinutes: 45, category: "work",
    weeklyTravelMinutes: 180, withinTravelTolerance: true,
    route: { anchorId: "work", durationMinutes: 30, walkingMinutes: 12, transfers: 1, modes: ["Train", "Bus"], ...overrides },
  };
}

test("explains a medium ShadowCommute using transparent route factors", () => {
  const result = analyseShadowCommute(anchorWithRoute({ alternativeDurationMinutes: 47 }));

  assert.equal(result.level, "medium");
  assert.equal(result.score, 3);
  assert.deepEqual(result.reasons, ["1 transfer", "12 min walking", "alternative route +17 min"]);
  assert.deepEqual(result.backupRoute, { status: "available", penaltyMinutes: 17 });
});

test("does not treat unavailable backup-route data as evidence of high fragility", () => {
  const result = analyseShadowCommute(anchorWithRoute({ walkingMinutes: 9 }));

  assert.equal(result.score, 2);
  assert.equal(result.level, "medium");
  assert.deepEqual(result.backupRoute, { status: "unavailable", message: "Backup route data unavailable." });
});
