import type { AddressTruthReport } from "@/lib/domain/analysis";

function isModule(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const reportModule = value as Record<string, unknown>;
  return (reportModule.status === "available" || reportModule.status === "unavailable")
    && (reportModule.coverage === "complete" || reportModule.coverage === "partial" || reportModule.coverage === "none")
    && typeof reportModule.source === "string";
}

export function isAddressTruthReport(value: unknown): value is AddressTruthReport {
  if (!value || typeof value !== "object") return false;
  const report = value as Record<string, unknown>;
  const property = report.property as Record<string, unknown> | undefined;
  const summary = report.summary as Record<string, unknown> | undefined;
  const modules = report.modules as Record<string, unknown> | undefined;
  return Boolean(
    property && typeof property.address === "string" && property.address.trim()
    && Array.isArray(report.routes) && Array.isArray(report.anchors) && Array.isArray(report.failedAnchors)
    && summary && Number.isFinite(summary.weeklyTravelMinutes) && Number.isFinite(summary.analysedAnchors)
    && modules && isModule(modules.transport) && isModule(modules.timeLens) && isModule(modules.shadowCommute) && isModule(modules.amenities) && isModule(modules.safety)
    && Array.isArray(report.insights) && Array.isArray(report.timeLens) && Array.isArray(report.shadowCommutes)
    && typeof report.generatedAt === "string",
  );
}
