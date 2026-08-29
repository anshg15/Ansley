import type { AnalysedAnchor, ShadowCommuteLevel, ShadowCommuteResult } from "@/lib/domain/analysis";

function scoreTransfers(transfers: number) {
  return transfers === 0 ? 0 : transfers === 1 ? 1 : 2;
}

function scoreWalking(walkingMinutes: number) {
  return walkingMinutes <= 8 ? 0 : walkingMinutes <= 15 ? 1 : 2;
}

function scoreBackupRoute(penaltyMinutes: number) {
  return penaltyMinutes <= 10 ? 0 : penaltyMinutes <= 20 ? 1 : 2;
}

function levelForScore(score: number): ShadowCommuteLevel {
  return score <= 1 ? "low" : score <= 3 ? "medium" : "high";
}

export function analyseShadowCommute(anchor: AnalysedAnchor): ShadowCommuteResult {
  const { route } = anchor;
  const reasons = [
    `${route.transfers} transfer${route.transfers === 1 ? "" : "s"}`,
    `${route.walkingMinutes} min walking`,
  ];
  const alternative = route.alternativeDurationMinutes;
  const backupRoute = alternative === undefined
    ? {
      status: "unavailable" as const,
      message: "Backup route data unavailable.",
    }
    : {
      status: "available" as const,
      penaltyMinutes: Math.max(0, alternative - route.durationMinutes),
    };

  const score = scoreTransfers(route.transfers)
    + scoreWalking(route.walkingMinutes)
    + (backupRoute.status === "available" ? scoreBackupRoute(backupRoute.penaltyMinutes) : 0);
  reasons.push(
    backupRoute.status === "available"
      ? `alternative route +${backupRoute.penaltyMinutes} min`
      : backupRoute.message,
  );

  return { anchorId: anchor.id, level: levelForScore(score), score, reasons, backupRoute };
}

export function analyseShadowCommutes(anchors: AnalysedAnchor[]) {
  return anchors.map(analyseShadowCommute);
}
