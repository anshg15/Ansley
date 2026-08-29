import assert from "node:assert/strict";
import test from "node:test";
import { decodedReportFixture } from "@/fixtures/address-truth-report";
import { transportSetupMessage } from "./transport-status";

test("gives an actionable setup explanation only for a missing live transport key", () => {
  const unconfigured = {
    ...decodedReportFixture,
    modules: { ...decodedReportFixture.modules, transport: { status: "unavailable", coverage: "none", source: "live", message: "Live transport analysis is temporarily unavailable." } as const },
    failedAnchors: [{ anchorId: "university", name: "University", message: "Live transport analysis is not configured yet." }],
  };
  assert.match(transportSetupMessage(unconfigured) ?? "", /TFNSW_API_KEY/);
  assert.equal(transportSetupMessage({ ...unconfigured, failedAnchors: [{ anchorId: "university", name: "University", message: "Live transport analysis is temporarily unavailable." }] }), undefined);
});
