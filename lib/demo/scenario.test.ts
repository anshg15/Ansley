import assert from "node:assert/strict";
import test from "node:test";
import { savedDemoRequest } from "./scenario";

test("provides an editable, complete three-destination demo routine", () => {
  assert.equal(savedDemoRequest.property.address, "18 Carillon Avenue, Newtown NSW 2042");
  assert.equal(savedDemoRequest.anchors.length, 3);
  assert.deepEqual(savedDemoRequest.anchors.map((anchor) => anchor.name), ["University", "Part-time work", "Gym"]);
  assert.deepEqual(savedDemoRequest.options?.timeLens, {
    anchorIds: ["university", "work"],
    periodIds: ["weekday-morning", "weekday-evening"],
  });
});
