import type { AddressTruthReport } from "@/lib/domain/analysis";

export function transportSetupMessage(report: AddressTruthReport) {
  const unavailableBecauseUnconfigured = report.modules.transport.status === "unavailable"
    && report.failedAnchors.length > 0
    && report.failedAnchors.every((anchor) => anchor.message.includes("not configured"));

  return unavailableBecauseUnconfigured
    ? "Live transport is not configured for this environment. Add TFNSW_API_KEY to .env.local and restart the server to calculate routes for addresses you enter."
    : undefined;
}
