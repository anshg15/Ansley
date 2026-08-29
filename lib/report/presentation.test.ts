import assert from "node:assert/strict"; import test from "node:test";
import { decodedReportFixture } from "@/fixtures/address-truth-report";
import { formatJourneyCadence, formatWeeklyBurden, reportVerdict } from "./presentation";
test("explains Routine Fit using deterministic, user-limit-based verdicts", () => { assert.match(reportVerdict(decodedReportFixture), /trade-offs/); assert.equal(formatWeeklyBurden(428), "7h 8m"); });
test("makes a route's weekly commitment explicit", () => { assert.equal(formatJourneyCadence(3, 228), "3 visits/week · 3h 48m return travel"); });
test("does not invent a verdict when no routes were assessed", () => { assert.match(reportVerdict({ ...decodedReportFixture, routineFit: null }), /could not assess/); });
