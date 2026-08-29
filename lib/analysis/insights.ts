import type { AnalysedAnchor, Insight, RoutineFit } from "@/lib/domain/analysis";

export function generateCoreInsights(
  anchors: AnalysedAnchor[],
  routineFit: RoutineFit | null,
): Insight[] {
  const insights: Insight[] = [];

  if (routineFit) {
    insights.push({
      type: "routine-fit",
      title: "Routine Fit",
      text: routineFit.explanation,
      severity: routineFit.percentage >= 75 ? "positive" : routineFit.percentage >= 50 ? "neutral" : "warning",
    });
  }

  const largestBurden = [...anchors].sort(
    (left, right) => right.weeklyTravelMinutes - left.weeklyTravelMinutes,
  )[0];
  const totalWeeklyTravelMinutes = anchors.reduce(
    (total, anchor) => total + anchor.weeklyTravelMinutes,
    0,
  );
  if (largestBurden && totalWeeklyTravelMinutes > 0) {
    const share = Math.round((largestBurden.weeklyTravelMinutes / totalWeeklyTravelMinutes) * 100);
    insights.push({
      type: "weekly-burden",
      title: `${largestBurden.name} is your biggest travel commitment`,
      text: `It accounts for ${share}% of your estimated weekly travel time (${formatWeeklyDuration(largestBurden.weeklyTravelMinutes)}).`,
      severity: "neutral",
    });
  }

  for (const anchor of anchors.filter((item) => !item.withinTravelTolerance)) {
    const overBy = anchor.route.durationMinutes - anchor.maxTravelMinutes;
    insights.push({
      type: "travel-tolerance",
      title: `${anchor.name} is outside your travel preference`,
      text: `${anchor.route.durationMinutes} minutes each way is ${overBy} minute${overBy === 1 ? "" : "s"} above your ${anchor.maxTravelMinutes}-minute limit.`,
      severity: "warning",
    });
  }

  return insights;
}

function formatWeeklyDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours === 0 ? `${remainingMinutes}m` : `${hours}h ${remainingMinutes}m`;
}
