import assert from "node:assert/strict";
import test from "node:test";
import journeyFixture from "@/fixtures/tfnsw-journey.json";
import { normaliseTfnswJourney } from "./normalise";

test("normalises a TfNSW journey without leaking provider-specific fields", () => {
  const route = normaliseTfnswJourney(journeyFixture, "uni");

  assert.deepEqual(route, {
    anchorId: "uni",
    durationMinutes: 33,
    walkingMinutes: 13,
    walkingDistanceMetres: 950,
    transfers: 0,
    modes: ["Train"],
    departureTime: "2026-08-29T08:00:00+10:00",
    arrivalTime: "2026-08-29T08:33:00+10:00",
    alternativeDurationMinutes: 41,
  });
});

test("treats numeric TfNSW durations as seconds and counts same-mode transfers", () => {
  const route = normaliseTfnswJourney({
    journeys: [{
      duration: 900,
      legs: [
        { type: "walk", duration: 180 },
        { transportation: { product: { name: "Bus" } }, duration: 300 },
        { transportation: { product: { name: "Bus" } }, duration: 420 },
      ],
    }],
  }, "work");

  assert.equal(route.durationMinutes, 15);
  assert.equal(route.walkingMinutes, 3);
  assert.equal(route.transfers, 1);
  assert.deepEqual(route.modes, ["Bus"]);
});

test("derives journey duration and recognises TfNSW footpath legs", () => {
  const route = normaliseTfnswJourney({
    journeys: [{
      legs: [
        { type: "footpath", duration: 420, distance: 520 },
        { transportation: { product: { name: "Sydney Buses Network" } }, duration: 1200 },
        { type: "footpath", duration: 360, distance: 430 },
      ],
    }],
  }, "uni");

  assert.equal(route.durationMinutes, 33);
  assert.equal(route.walkingMinutes, 13);
  assert.equal(route.walkingDistanceMetres, 950);
  assert.equal(route.transfers, 0);
  assert.deepEqual(route.modes, ["Sydney Buses Network"]);
});
