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
