import assert from "node:assert/strict"; import test from "node:test";
import { decodedReportFixture } from "@/fixtures/address-truth-report";
import { formatJourneyCadence, formatWeeklyBurden, reportVerdict, routineFitBreakdown, weeklyBurdenBreakdown } from "./presentation";
test("explains Routine Fit using deterministic, user-limit-based verdicts", () => { assert.match(reportVerdict(decodedReportFixture), /trade-offs/); assert.equal(formatWeeklyBurden(428), "7h 8m"); });
test("makes a route's weekly commitment explicit", () => { assert.equal(formatJourneyCadence(3, 228), "3 visits/week · 3h 48m return travel"); });
test("does not invent a verdict when no routes were assessed", () => { assert.match(reportVerdict({ ...decodedReportFixture, routineFit: null }), /could not assess/); });
test("orders weekly burden by impact while retaining transparent totals", () => {
  assert.deepEqual(weeklyBurdenBreakdown(decodedReportFixture).map((item) => ({ name: item.name, minutes: item.weeklyTravelMinutes, share: item.percentageOfTotal, bar: item.barPercentage })), [
    { name: "Part-time work", minutes: 228, share: 53, bar: 100 },
    { name: "University", minutes: 144, share: 34, bar: 63 },
    { name: "Gym", minutes: 56, share: 13, bar: 25 },
  ]);
});
test("keeps explainability safe when no route or Routine Fit is available", () => {
  assert.deepEqual(weeklyBurdenBreakdown({ ...decodedReportFixture, routes: [], summary: { ...decodedReportFixture.summary, weeklyTravelMinutes: 0 } }), []);
  assert.equal(routineFitBreakdown({ ...decodedReportFixture, routineFit: null }), undefined);
});
