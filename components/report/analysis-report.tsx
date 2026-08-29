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
  return <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.17em] text-muted-ink">{children}</p>;
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
    <section aria-labelledby="report-heading" className="p-6 sm:p-9 lg:p-10">
      <header className="border-b border-border pb-7">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.19em] text-moss">Your life at this address</p>
            <h2 id="report-heading" tabIndex={-1} className="font-editorial mt-3 text-4xl font-medium leading-[1.02] tracking-[-0.045em] outline-none sm:text-5xl">
              {report.property.address}
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-ink">
              Generated {new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(report.generatedAt))}. Read this as a decision aid: route availability and approximation notes remain visible below.
            </p>
          </div>
          <button type="button" onClick={onEdit} className="button-secondary min-h-0 px-4 py-2 text-sm">Edit details <span aria-hidden="true">↙</span></button>
        </div>

        {demo ? (
          <p role="status" className="mt-5 border-l-2 border-amber bg-amber/10 px-4 py-3 text-sm leading-6">
            <strong>Saved demo snapshot.</strong> TfNSW example captured 29 Aug 2026; these are not live route results.
          </p>
        ) : null}
      </header>

      {transportMessage ? (
        <div className="mt-6 border border-amber/35 bg-amber/8 p-4">
          <Eyebrow>Transport status</Eyebrow>
          <p role="status" className="mt-2 text-sm leading-6 text-ink">{setupMessage ?? transportMessage}</p>
          {setupMessage && onOpenDemo ? <button type="button" onClick={onOpenDemo} className="mt-3 text-sm font-semibold underline decoration-border underline-offset-4">View the clearly labelled saved demo</button> : null}
        </div>
      ) : null}

      <section aria-label="Report summary" className="mt-8 grid gap-px border border-border bg-border md:grid-cols-3">
        <article className="bg-paper p-5 sm:p-6">
          <Eyebrow>Routine Fit</Eyebrow>
          <p className="font-editorial mt-3 text-5xl font-medium tracking-[-0.05em]">{report.routineFit ? `${report.routineFit.percentage}%` : "—"}</p>
          <p className="mt-3 text-sm leading-6 text-muted-ink">{report.routineFit?.explanation ?? "No route could be assessed."}</p>
        </article>
        <article className="bg-paper p-5 sm:p-6">
          <Eyebrow>Weekly travel</Eyebrow>
          <p className="font-editorial mt-3 text-5xl font-medium tracking-[-0.05em]">{formatWeeklyBurden(report.summary.weeklyTravelMinutes)}</p>
          <p className="mt-3 text-sm leading-6 text-muted-ink">Estimated return travel across the routine you entered.</p>
        </article>
        <article className="bg-paper p-5 sm:p-6">
          <Eyebrow>Coverage</Eyebrow>
          <p className="font-editorial mt-3 text-5xl font-medium tracking-[-0.05em]">{report.summary.analysedAnchors}<span className="text-2xl text-muted-ink">/{report.summary.analysedAnchors + report.failedAnchors.length}</span></p>
          <p className="mt-3 text-sm leading-6 text-muted-ink">Submitted destinations with usable route analysis.</p>
        </article>
      </section>

      <section aria-label="Address verdict" className="mt-6 grid gap-5 border-y border-moss/35 bg-moss/5 px-1 py-6 sm:grid-cols-[0.28fr_0.72fr] sm:px-5">
        <div><Eyebrow>Decoded verdict</Eyebrow></div>
        <div>
          <p className="font-editorial text-2xl font-medium leading-snug tracking-[-0.025em]">{reportVerdict(report)}</p>
          <p className="mt-3 text-sm leading-6 text-muted-ink">Routine Fit compares each regular journey with the travel limit you chose. Weekly travel estimates return journeys and is not a prediction of exact future commuting time.</p>
        </div>
      </section>

      {fitBreakdown ? (
        <section aria-labelledby="fit-explained-heading" className="mt-8 grid gap-5 border border-border bg-parchment/45 p-5 sm:grid-cols-[0.28fr_0.72fr] sm:p-6">
          <Eyebrow>Why this score</Eyebrow>
          <div>
            <h3 id="fit-explained-heading" className="text-lg font-semibold">{fitBreakdown.passingVisits} of {fitBreakdown.totalVisits} weekly visits are within your limit</h3>
            <p className="mt-2 text-sm leading-6 text-muted-ink">The {fitBreakdown.percentage}% result weights destinations by visit frequency, rather than treating an occasional trip and a daily trip as equally important.</p>
          </div>
        </section>
      ) : null}

      {burdenBreakdown.length > 0 ? (
        <section aria-labelledby="burden-heading" className="mt-10 border-t border-border pt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Weekly travel burden</Eyebrow>
              <h3 id="burden-heading" className="font-editorial mt-2 text-3xl font-medium tracking-[-0.035em]">Where your week goes</h3>
            </div>
            <p className="text-xs leading-5 text-muted-ink">Return travel · ranked by total time</p>
          </div>
          <ol className="mt-6 divide-y divide-border border-y border-border">
            {burdenBreakdown.map((item, index) => (
              <li key={item.anchorId} className="grid gap-3 py-5 sm:grid-cols-[2rem_1fr_auto] sm:items-center sm:gap-5">
                <span className="font-mono text-xs text-moss">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm font-semibold sm:hidden">{formatWeeklyBurden(item.weeklyTravelMinutes)}</p>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-muted-ink">{item.visitsPerWeek} visit{item.visitsPerWeek === 1 ? "" : "s"}/week · {item.percentageOfTotal}% of weekly travel</p>
                  <div className="mt-3 h-1.5 overflow-hidden bg-border/60" aria-hidden="true"><div className="h-full bg-moss" style={{ width: `${item.barPercentage}%` }} /></div>
                </div>
                <p className="hidden text-sm font-semibold sm:block">{formatWeeklyBurden(item.weeklyTravelMinutes)}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section aria-labelledby="routes-heading" className="mt-10 border-t border-border pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>LifeRadius</Eyebrow>
            <h3 id="routes-heading" className="font-editorial mt-2 text-3xl font-medium tracking-[-0.035em]">Your regular journeys</h3>
          </div>
          <p className="max-w-xs text-right text-xs leading-5 text-muted-ink">One-way route times; weekly totals include estimated return travel.</p>
        </div>

        {report.routes.length > 0 ? (
          <ul className="mt-6 grid gap-4 lg:grid-cols-2">
            {report.routes.map((route, index) => {
              const anchor = report.anchors.find((item) => item.id === route.anchorId);
              return (
                <li key={route.anchorId} className="relative overflow-hidden border border-border bg-paper p-5">
                  <div className="absolute right-4 top-4 font-mono text-[0.62rem] text-muted-ink">R{String(index + 1).padStart(2, "0")}</div>
                  <p className="pr-10 text-sm font-semibold">{anchor?.name ?? "Regular destination"}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-ink">{route.transportMode} · {route.transfers === 0 ? "no transfers" : `${route.transfers} transfer${route.transfers === 1 ? "" : "s"}`} · {route.walkingMinutes} min walking</p>
                  <div className="mt-6 flex items-end justify-between gap-4 border-t border-border pt-4">
                    <div>
                      <p className="font-editorial text-4xl font-medium tracking-[-0.045em]">{route.durationMinutes}<span className="ml-1 text-base text-muted-ink">min</span></p>
                      <p className="mt-1 text-xs text-muted-ink">one way</p>
                    </div>
                    <p className={route.withinTolerance ? "rounded-full border border-moss/30 bg-moss/8 px-3 py-1.5 text-xs font-semibold text-moss" : "rounded-full border border-danger/30 bg-danger/5 px-3 py-1.5 text-xs font-semibold text-danger"}>
                      {route.withinTolerance ? "Within your limit" : "Over your limit"}
                    </p>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-muted-ink">{formatJourneyCadence(anchor?.visitsPerWeek ?? 0, route.weeklyTravelMinutes)}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-6 border border-border bg-parchment/40 p-5 text-sm leading-6 text-muted-ink">No live journeys were available for this request. Edit the details and try again, or use the clearly labelled saved demo when offered.</p>
        )}

        {report.failedAnchors.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {report.failedAnchors.map((anchor) => <li key={anchor.anchorId} className="border-l-2 border-amber bg-amber/10 px-4 py-3 text-sm leading-6"><strong>{anchor.name}:</strong> {anchor.message}</li>)}
          </ul>
        ) : null}
      </section>

      {report.timeLens.some((item) => item.status === "available") ? (
        <section aria-labelledby="timelens-heading" className="mt-10 border-t border-border pt-8">
          <Eyebrow>TimeLens</Eyebrow>
          <h3 id="timelens-heading" className="font-editorial mt-2 text-3xl font-medium tracking-[-0.035em]">Morning and evening</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {report.timeLens.filter((item) => item.status === "available").map((item) => (
              <article key={item.anchorId} className="border border-border bg-parchment/35 p-5">
                <p className="text-sm font-semibold">{report.anchors.find((anchor) => anchor.id === item.anchorId)?.name ?? "Regular destination"}</p>
                <dl className="mt-4 grid grid-cols-2 gap-px bg-border">
                  {item.periods.map((period) => <div key={period.id} className="bg-paper p-3"><dt className="text-xs text-muted-ink">{period.label}</dt><dd className="font-editorial mt-1 text-2xl font-medium">{period.durationMinutes}m</dd></div>)}
                </dl>
                {item.variationMinutes !== undefined ? <p className="mt-3 text-xs leading-5 text-muted-ink">Up to {item.variationMinutes} minutes of variation in the sampled periods.</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {report.shadowCommutes.length > 0 ? (
        <section aria-labelledby="shadow-heading" className="mt-10 border-t border-border pt-8">
          <Eyebrow>ShadowCommute</Eyebrow>
          <h3 id="shadow-heading" className="font-editorial mt-2 text-3xl font-medium tracking-[-0.035em]">Route resilience, not a disruption prediction</h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {report.shadowCommutes.map((item) => (
              <li key={item.anchorId} className="border border-border p-4">
                <div className="flex items-center justify-between gap-4"><p className="text-sm font-semibold">{report.anchors.find((anchor) => anchor.id === item.anchorId)?.name ?? "Regular destination"}</p><span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-moss">{item.level}</span></div>
                <p className="mt-2 text-sm leading-6 text-muted-ink">{item.reasons.join(" · ")}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {report.insights.length > 0 ? (
        <section aria-labelledby="insights-heading" className="mt-10 border-t border-border pt-8">
          <Eyebrow>What stands out</Eyebrow>
          <h3 id="insights-heading" className="font-editorial mt-2 text-3xl font-medium tracking-[-0.035em]">Key insights</h3>
          <ol className="mt-5 divide-y divide-border border-y border-border">
            {report.insights.map((insight, index) => (
              <li key={insight.id} className="grid gap-3 py-5 sm:grid-cols-[2rem_1fr] sm:gap-5">
                <span className="font-mono text-xs text-transit-coral">{String(index + 1).padStart(2, "0")}</span>
                <div><p className="font-semibold">{insight.title}</p><p className="mt-1 text-sm leading-6 text-muted-ink">{insight.explanation}</p></div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section aria-label="Data availability" className="mt-10 border-t border-border pt-7">
        <div className="grid gap-5 sm:grid-cols-[0.28fr_0.72fr]">
          <Eyebrow>Data availability</Eyebrow>
          <div>
            <ul className="space-y-2 text-sm leading-6 text-muted-ink">
              {unavailableModules.flatMap(([name, module]) => {
                const message = moduleMessage(module);
                return message ? [<li key={name}><strong className="font-semibold text-ink">{name}:</strong> {message}</li>] : [];
              })}
            </ul>
            <p className="mt-4 text-xs leading-5 text-muted-ink">Unavailable modules are omitted from the main story rather than represented by empty cards or invented values.</p>
          </div>
        </div>
      </section>
    </section>
  );
}
