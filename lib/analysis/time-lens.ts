import type {
  AnalysedAnchor,
  AnalysisOptions,
  RepresentativeDeparture,
  TimeLensPeriod,
  TimeLensPeriodId,
  TimeLensResult,
} from "@/lib/domain/analysis";
import type { TransportProvider } from "./analyse";

const MAX_TIME_LENS_ANCHORS = 2;
const MAX_TIME_LENS_PERIODS = 2;

const periodDefinitions: Record<TimeLensPeriodId, { label: string; time: string }> = {
  "weekday-morning": { label: "Weekday morning · 8:00 AM", time: "08:00" },
  "weekday-evening": { label: "Weekday evening · 6:00 PM", time: "18:00" },
};

function enabledTimeLensOptions(options: AnalysisOptions | undefined) {
  if (!options?.timeLens) return null;
  return options.timeLens === true ? {} : options.timeLens;
}

export function isTimeLensEnabled(options: AnalysisOptions | undefined) {
  return enabledTimeLensOptions(options) !== null;
}

export function selectTimeLensAnchors(anchors: AnalysedAnchor[], options: AnalysisOptions | undefined) {
  const timeLensOptions = enabledTimeLensOptions(options);
  if (timeLensOptions === null) return [];

  const selected = timeLensOptions.anchorIds
    ? anchors.filter((anchor) => timeLensOptions.anchorIds?.includes(anchor.id))
    : [...anchors].sort((left, right) => right.visitsPerWeek - left.visitsPerWeek);
  return selected.slice(0, MAX_TIME_LENS_ANCHORS);
}

function selectedPeriodIds(options: AnalysisOptions | undefined) {
  const selected = enabledTimeLensOptions(options)?.periodIds ?? ["weekday-morning", "weekday-evening"];
  return selected.slice(0, MAX_TIME_LENS_PERIODS);
}

function nextSydneyWeekdayDate(now = new Date()) {
  const dateParts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(
    dateParts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );
  const date = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)));
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() + (day === 6 ? 2 : day === 0 ? 1 : 0));
  return date.toISOString().slice(0, 10);
}

export function representativeDepartures(options: AnalysisOptions | undefined, now = new Date()) {
  const date = nextSydneyWeekdayDate(now);
  return selectedPeriodIds(options).map((id) => ({
    id,
    label: periodDefinitions[id].label,
    departure: { date, time: periodDefinitions[id].time, timeZone: "Australia/Sydney" } satisfies RepresentativeDeparture,
  }));
}

export async function analyseTimeLens(
  propertyAddress: string,
  anchors: AnalysedAnchor[],
  options: AnalysisOptions | undefined,
  transportProvider: TransportProvider,
): Promise<TimeLensResult[]> {
  const selectedAnchors = selectTimeLensAnchors(anchors, options);
  if (selectedAnchors.length === 0) return [];
  if (!transportProvider.analyseJourneyAt) {
    return selectedAnchors.map((anchor) => unavailableResult(anchor.id, "Representative-time analysis is unavailable."));
  }

  const departures = representativeDepartures(options);
  const results: TimeLensResult[] = [];
  for (const anchor of selectedAnchors) {
    try {
      // Keep the provider load capped at the two selected representative periods.
      const routes = await Promise.all(departures.map(({ departure }) => (
        transportProvider.analyseJourneyAt!(propertyAddress, anchor.address, anchor.id, departure)
      )));
      const periods: TimeLensPeriod[] = routes.map((route, index) => ({
        id: departures[index].id,
        label: departures[index].label,
        durationMinutes: route.durationMinutes,
      }));
      const durations = periods.map((period) => period.durationMinutes);
      const minDurationMinutes = Math.min(...durations);
      const maxDurationMinutes = Math.max(...durations);
      results.push({
        anchorId: anchor.id,
        status: "available" as const,
        periods,
        minDurationMinutes,
        maxDurationMinutes,
        variationMinutes: maxDurationMinutes - minDurationMinutes,
      });
    } catch {
      results.push(unavailableResult(anchor.id, "Representative-time analysis is temporarily unavailable; showing the primary route only."));
    }
  }
  return results;
}

function unavailableResult(anchorId: string, message: string): TimeLensResult {
  return { anchorId, status: "unavailable", periods: [], message };
}
