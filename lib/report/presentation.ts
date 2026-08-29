import type { AddressTruthReport } from "@/lib/domain/analysis";

export function reportVerdict(report: AddressTruthReport) {
  const fit = report.routineFit?.percentage;
  if (fit === undefined) return "We could not assess this address against your routine yet.";
  if (fit >= 75) return "This address works well for the routine and travel limits you set.";
  if (fit >= 50) return "This address works for much of your routine, with a few trade-offs to weigh.";
  return "This address puts important parts of your routine outside the travel limits you set.";
}

export function formatWeeklyBurden(minutes: number) {
  const hours = Math.floor(minutes / 60); const remainder = minutes % 60;
  return hours ? `${hours}h ${remainder}m` : `${remainder}m`;
}

export function formatJourneyCadence(visitsPerWeek: number, weeklyTravelMinutes: number) {
  return `${visitsPerWeek} visit${visitsPerWeek === 1 ? "" : "s"}/week · ${formatWeeklyBurden(weeklyTravelMinutes)} return travel`;
}

export type WeeklyBurdenItem = {
  anchorId: string;
  name: string;
  visitsPerWeek: number;
  weeklyTravelMinutes: number;
  percentageOfTotal: number;
  barPercentage: number;
};

/**
 * Converts provider-independent route results into an ordered, explainable
 * comparison. Percentages are rounded only for display; minute totals remain
 * the source of truth in every route card.
 */
export function weeklyBurdenBreakdown(report: AddressTruthReport): WeeklyBurdenItem[] {
  const total = report.summary.weeklyTravelMinutes;
  const items = report.routes.map((route) => {
    const anchor = report.anchors.find((item) => item.id === route.anchorId);
    return {
      anchorId: route.anchorId,
      name: anchor?.name ?? "Regular destination",
      visitsPerWeek: anchor?.visitsPerWeek ?? 0,
      weeklyTravelMinutes: route.weeklyTravelMinutes,
    };
  }).sort((left, right) => right.weeklyTravelMinutes - left.weeklyTravelMinutes);
  const largest = items[0]?.weeklyTravelMinutes ?? 0;

  return items.map((item) => ({
    ...item,
    percentageOfTotal: total > 0 ? Math.round((item.weeklyTravelMinutes / total) * 100) : 0,
    barPercentage: largest > 0 ? Math.round((item.weeklyTravelMinutes / largest) * 100) : 0,
  }));
}

export function routineFitBreakdown(report: AddressTruthReport) {
  if (!report.routineFit) return undefined;
  return {
    percentage: report.routineFit.percentage,
    passingVisits: report.routineFit.passingVisitsPerWeek,
    totalVisits: report.routineFit.totalVisitsPerWeek,
  };
}
