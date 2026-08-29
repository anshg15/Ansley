import type { AddressTruthReport } from "@/lib/domain/analysis";
export function isAddressTruthReport(value: unknown): value is AddressTruthReport {
  if (!value || typeof value !== "object") return false;
  const report = value as Record<string, unknown>;
  return Boolean(report.property && typeof report.property === "object" && Array.isArray(report.routes) && Array.isArray(report.anchors) && Array.isArray(report.failedAnchors) && report.summary && typeof report.summary === "object" && report.modules && typeof report.modules === "object" && Array.isArray(report.insights));
}
