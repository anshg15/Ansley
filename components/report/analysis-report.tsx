import type { AddressTruthReport, ReportModule } from "@/lib/domain/analysis";
import {
  formatJourneyCadence,
  formatWeeklyBurden,
  reportVerdict,
  routineFitBreakdown,
  weeklyBurdenBreakdown,
} from "@/lib/report/presentation";
import { transportSetupMessage } from "@/lib/report/transport-status";

function moduleMessage(module: ReportModule) {
  if (module.coverage === "partial") return module.message ?? "Some results are unavailable.";
  return module.status === "unavailable" ? module.message : undefined;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.17em] text-muted-ink">{children}</p>;
}

export function AnalysisReport({ report, onEdit, onOpenDemo, demo = false }: { report: AddressTruthReport; onEdit: () => void; onOpenDemo?: () => void; demo?: boolean }) {
  const transportMessage = moduleMessage(report.modules.transport);
  const setupMessage = transportSetupMessage(report);
  const fitBreakdown = routineFitBreakdown(report);
  const burdenBreakdown = weeklyBurdenBreakdown(report);
  const unavailableModules = [
    ["TimeLens", report.modules.timeLens],
    ["ShadowCommute", report.modules.shadowCommute],
    ["Everyday Access", report.modules.amenities],
    ["Safety Context", report.modules.safety],
  ] as const;

  return (
    <section aria-labelledby="report-heading" className="p-6 sm:p-8 lg:p-9">
      <header className="border-b border-border pb-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-moss">Your life at this address</p>
            <h2 id="report-heading" tabIndex={-1} className="font-editorial mt-3 text-4xl font-medium leading-[1.02] tracking-[-0.045em] outline-none sm:text-5xl">
              {report.property.address}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-ink">
              Analysis generated {new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(report.generatedAt))}.
            </p>
            {demo ? <p role="status" className="mt-4 border-l-2 border-amber bg-amber/10 px-4 py-3 text-sm leading-6">Saved TfNSW demo snapshot captured 29 Aug 2026. It is not live route data.</p> : null}
          </div>
          <button type="button" onClick={onEdit} className="button-secondary min-h-0 px-4 py-2 text-sm">Edit details <span aria-hidden="true">←</span></button>
        </div>
      </header>

      {transportMessage ? (
        <p role="status" className="mt-5 border-l-2 border-amber bg-amber/10 px-4 py-3 text-sm leading-6 text-ink">
          {setupMessage ?? transportMessage}
        </p>
      ) : null}
      {setupMessage && onOpenDemo ? <button type="button" onClick={onOpenDemo} className="button-secondary mt-3">View the saved demo instead <span aria-hidden="true">↗</span></button> : null}

      <dl className="mt-7 grid gap-px border border-border bg-border md:grid-cols-3">
        <div className="bg-paper p-5 sm:p-6">
          <dt><Eyebrow>Routine Fit</Eyebrow></dt>
          <dd className="font-editorial mt-3 text-5xl font-medium tracking-[-0.05em]">{report.routineFit ? `${report.routineFit.percentage}%` : "—"}</dd>
          <p className="mt-3 text-sm leading-6 text-muted-ink">{report.routineFit?.explanation ?? "No route could be assessed."}</p>
        </div>
        <div className="bg-paper p-5 sm:p-6">
          <dt><Eyebrow>Weekly travel</Eyebrow></dt>
          <dd className="font-editorial mt-3 text-5xl font-medium tracking-[-0.05em]">{formatWeeklyBurden(report.summary.weeklyTravelMinutes)}</dd>
          <p className="mt-3 text-sm leading-6 text-muted-ink">Estimated return travel across your routine.</p>
        </div>
        <div className="bg-paper p-5 sm:p-6">
          <dt><Eyebrow>Destinations analysed</Eyebrow></dt>
          <dd className="font-editorial mt-3 text-5xl font-medium tracking-[-0.05em]">{report.summary.analysedAnchors}</dd>
          <p className="mt-3 text-sm leading-6 text-muted-ink">Of {report.summary.analysedAnchors + report.failedAnchors.length} submitted.</p>
        </div>
      </dl>

      <section aria-label="Address verdict" className="mt-6 grid gap-5 border-y border-moss/35 bg-moss/5 py-6 sm:grid-cols-[0.28fr_0.72fr] sm:px-5">
        <Eyebrow>Decoded verdict</Eyebrow>
        <div>
          <p className="font-editorial text-2xl font-medium leading-snug tracking-[-0.025em]">{reportVerdict(report)}</p>
          <p className="mt-3 text-sm leading-6 text-muted-ink">Routine Fit compares each regular journey with the travel limit you chose; weekly travel estimates return journeys.</p>
        </div>
      </section>

      {fitBreakdown ? (
        <section aria-labelledby="fit-explained-heading" className="mt-7 grid gap-5 border border-border bg-parchment/45 p-5 sm:grid-cols-[0.28fr_0.72fr] sm:p-6">
          <Eyebrow>Why this score</Eyebrow>
          <div>
            <h3 id="fit-explained-heading" className="text-lg font-semibold">{fitBreakdown.passingVisits} of {fitBreakdown.totalVisits} weekly visits are within your limit</h3>
            <p className="mt-2 text-sm leading-6 text-muted-ink">Routine Fit is {fitBreakdown.percentage}% because it weights each destination by how often you travel there, rather than treating every destination equally.</p>
          </div>
        </section>
      ) : null}

      {burdenBreakdown.length > 0 ? (
        <section aria-labelledby="burden-heading" className="mt-9 border-t border-border pt-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Weekly travel burden</Eyebrow>
              <h3 id="burden-heading" className="font-editorial mt-2 text-3xl font-medium tracking-[-0.035em]">Where your week goes</h3>
            </div>
            <p className="text-sm leading-5 text-muted-ink">Return travel, ranked by total time.</p>
          </div>
          <ol className="mt-5 divide-y divide-border border-y border-border">
            {burdenBreakdown.map((item, index) => (
              <li key={item.anchorId} className="grid gap-3 py-5 sm:grid-cols-[2rem_1fr_auto] sm:items-center sm:gap-5">
                <span className="font-mono text-xs text-moss">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm leading-5 text-muted-ink">{item.visitsPerWeek} visit{item.visitsPerWeek === 1 ? "" : "s"}/week · {item.percentageOfTotal}% of your weekly travel</p>
                  <div className="mt-3 h-1.5 overflow-hidden bg-border/60" aria-hidden="true"><div className="h-full bg-moss" style={{ width: `${item.barPercentage}%` }} /></div>
                </div>
                <p className="text-sm font-semibold">{formatWeeklyBurden(item.weeklyTravelMinutes)}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section aria-labelledby="routes-heading" className="mt-9 border-t border-border pt-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>LifeRadius</Eyebrow>
            <h3 id="routes-heading" className="font-editorial mt-2 text-3xl font-medium tracking-[-0.035em]">Your regular journeys</h3>
          </div>
          <p className="text-right text-xs leading-5 text-muted-ink">One-way route times; weekly total includes return travel.</p>
        </div>

        {report.routes.length > 0 ? (
          <ul className="mt-5 grid gap-4 lg:grid-cols-2">
            {report.routes.map((route, index) => {
              const anchor = report.anchors.find((item) => item.id === route.anchorId);
              return (
                <li key={route.anchorId} className="relative overflow-hidden border border-border bg-paper p-5 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-border-strong">
                  <span className="absolute right-4 top-4 font-mono text-[0.62rem] text-muted-ink" aria-hidden="true">R{String(index + 1).padStart(2, "0")}</span>
                  <p className="pr-10 font-semibold">{anchor?.name ?? "Regular destination"}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-ink">{route.transportMode} · {route.transfers === 0 ? "no transfers" : `${route.transfers} transfer${route.transfers === 1 ? "" : "s"}`} · {route.walkingMinutes} min walking</p>
                  <p className="mt-1 text-sm leading-6 text-muted-ink">{formatJourneyCadence(anchor?.visitsPerWeek ?? 0, route.weeklyTravelMinutes)}</p>
                  <div className="mt-5 flex items-end justify-between gap-4 border-t border-border pt-4">
                    <p className="font-editorial text-4xl font-medium tracking-[-0.045em]">{route.durationMinutes}m <span className="text-sm font-normal tracking-normal text-muted-ink">one way</span></p>
                    <p className={route.withinTolerance ? "text-sm font-medium text-moss" : "text-sm font-medium text-danger"}>
                      {route.withinTolerance ? "Within your limit" : "Over your limit"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : <p className="py-6 text-sm leading-6 text-muted-ink">No live journeys were available for this request. You can edit the details and try again.</p>}

        {report.failedAnchors.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {report.failedAnchors.map((anchor) => <li key={anchor.anchorId} className="border border-amber/40 bg-amber/10 px-4 py-3 text-sm leading-6"><strong>{anchor.name}:</strong> {anchor.message}</li>)}
          </ul>
        ) : null}
      </section>

      {report.timeLens.some((item) => item.status === "available") ? (
        <section aria-labelledby="timelens-heading" className="mt-9 border-t border-border pt-7">
          <Eyebrow>TimeLens</Eyebrow>
          <h3 id="timelens-heading" className="font-editorial mt-2 text-3xl font-medium tracking-[-0.035em]">Morning and evening</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {report.timeLens.filter((item) => item.status === "available").map((item) => (
              <article key={item.anchorId} className="border border-border bg-parchment/35 p-4">
                <p className="font-medium">{report.anchors.find((anchor) => anchor.id === item.anchorId)?.name ?? "Regular destination"}</p>
                <dl className="mt-3 grid grid-cols-2 gap-px bg-border">
                  {item.periods.map((period) => <div key={period.id} className="bg-paper p-3"><dt className="text-sm text-muted-ink">{period.label}</dt><dd className="font-editorial mt-1 text-2xl font-medium">{period.durationMinutes}m</dd></div>)}
                </dl>
                {item.variationMinutes !== undefined ? <p className="mt-3 text-sm text-muted-ink">Up to {item.variationMinutes} minutes of variation.</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {report.shadowCommutes.length > 0 ? (
        <section aria-labelledby="shadow-heading" className="mt-9 border-t border-border pt-7">
          <Eyebrow>ShadowCommute</Eyebrow>
          <h3 id="shadow-heading" className="font-editorial mt-2 text-3xl font-medium tracking-[-0.035em]">Route resilience, not a disruption prediction</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {report.shadowCommutes.map((item) => (
              <li key={item.anchorId} className="border border-border p-4">
                <p className="font-medium">{report.anchors.find((anchor) => anchor.id === item.anchorId)?.name ?? "Regular destination"} · <span className="capitalize">{item.level}</span></p>
                <p className="mt-1 text-sm leading-6 text-muted-ink">{item.reasons.join(" · ")}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {report.insights.length > 0 ? (
        <section aria-labelledby="insights-heading" className="mt-9 border-t border-border pt-7">
          <Eyebrow>What stands out</Eyebrow>
          <h3 id="insights-heading" className="font-editorial mt-2 text-3xl font-medium tracking-[-0.035em]">Key insights</h3>
          <ul className="mt-4 space-y-3">
            {report.insights.map((insight) => <li key={insight.id} className="border-l-2 border-moss pl-4"><p className="font-medium">{insight.title}</p><p className="mt-1 text-sm leading-6 text-muted-ink">{insight.explanation}</p></li>)}
          </ul>
        </section>
      ) : null}

      <section aria-label="Data availability" className="mt-9 border-t border-border pt-6">
        <Eyebrow>Data availability</Eyebrow>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-ink">
          {unavailableModules.flatMap(([name, module]) => {
            const message = moduleMessage(module);
            return message ? [<li key={name}><strong className="font-medium text-ink">{name}:</strong> {message}</li>] : [];
          })}
        </ul>
      </section>
    </section>
  );
}
