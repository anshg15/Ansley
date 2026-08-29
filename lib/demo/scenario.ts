import type { AnalysisRequest } from "@/lib/domain/analysis";
import { decodedReportFixture } from "@/fixtures/address-truth-report";

/**
 * A deliberately labelled, saved scenario for product tours and local demos.
 * It is shaped like a normal request so "Edit details" remains useful after
 * opening the fixture, but it never masquerades as a live provider response.
 */
export const savedDemoRequest: AnalysisRequest = {
  property: decodedReportFixture.property,
  anchors: decodedReportFixture.anchors.map((anchor) => ({
    id: anchor.id,
    name: anchor.name,
    address: anchor.address,
    visitsPerWeek: anchor.visitsPerWeek,
    maxTravelMinutes: anchor.maxTravelMinutes,
    category: anchor.category,
  })),
  options: {
    timeLens: {
      anchorIds: decodedReportFixture.timeLens.map((item) => item.anchorId),
      periodIds: ["weekday-morning", "weekday-evening"],
    },
  },
  userProfile: { preset: "student" },
  preferences: [],
};
