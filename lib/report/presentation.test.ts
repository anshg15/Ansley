import assert from "node:assert/strict"; import test from "node:test";
import { decodedReportFixture } from "@/fixtures/address-truth-report";
import { formatWeeklyBurden, reportVerdict } from "./presentation";
test("explains Routine Fit using deterministic, user-limit-based verdicts", () => { assert.match(reportVerdict(decodedReportFixture), /trade-offs/); assert.equal(formatWeeklyBurden(428), "7h 8m"); });
test("does not invent a verdict when no routes were assessed", () => { assert.match(reportVerdict({ ...decodedReportFixture, routineFit: null }), /could not assess/); });
