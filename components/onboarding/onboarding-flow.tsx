"use client";

import { useRef, useState, type FormEvent } from "react";
import type { AddressTruthReport, AnalysisRequest, AnchorCategory } from "@/lib/domain/analysis";
import type { UserPreset } from "@/lib/domain/user-profile";
import { AnalysisReport } from "@/components/report/analysis-report";
import { savedDemoRequest } from "@/lib/demo/scenario";
import { decodedReportFixture } from "@/fixtures/address-truth-report";
import { isAddressTruthReport } from "@/lib/report/contract";
import {
  buildAnalysisRequest,
  createAnchor,
  OnboardingDraftError,
  type AnchorDraft,
  type OnboardingErrors,
  validatePropertyAddress,
} from "@/lib/onboarding/draft";

type Step = "property" | "routine" | "review" | "analysing" | "report";

const categories: AnchorCategory[] = ["work", "education", "health", "social", "exercise", "other"];
const presets: UserPreset[] = ["student", "professional", "family", "custom"];

function FieldError({ message }: { message?: string }) {
  return message ? <p role="alert" className="mt-1.5 text-sm text-danger">{message}</p> : null;
}

function StepMarker({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {[1, 2, 3].map((step) => (
        <span
          key={step}
          className={`h-1 rounded-full transition-[width,background-color] ${step === current ? "w-8 bg-moss" : step < current ? "w-4 bg-moss/45" : "w-4 bg-border"}`}
        />
      ))}
    </div>
  );
}

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("property");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [propertyError, setPropertyError] = useState<string>();
  const [preset, setPreset] = useState<UserPreset>("custom");
  const [timeLens, setTimeLens] = useState(true);
  const [anchors, setAnchors] = useState<AnchorDraft[]>([createAnchor("anchor-1")]);
  const [errors, setErrors] = useState<OnboardingErrors>({});
  const [request, setRequest] = useState<AnalysisRequest>();
  const [report, setReport] = useState<AddressTruthReport>();
  const [analysisError, setAnalysisError] = useState<string>();
  const [usingDemo, setUsingDemo] = useState(false);
  const nextId = useRef(2);

  function updateAnchor(index: number, field: keyof AnchorDraft, value: string) {
    setAnchors((current) => current.map((anchor, position) => position === index ? { ...anchor, [field]: value } : anchor));
    setErrors((current) => ({ ...current, [`anchors.${index}.${field}`]: "" }));
  }

  function addAnchor() {
    setAnchors((current) => current.length < 4 ? [...current, createAnchor(`anchor-${nextId.current++}`)] : current);
  }

  function removeAnchor(index: number) {
    setAnchors((current) => current.length > 1 ? current.filter((_, position) => position !== index) : current);
  }

  function submitProperty(event: FormEvent) {
    event.preventDefault();
    const error = validatePropertyAddress(propertyAddress);
    setPropertyError(error);
    if (!error) setStep("routine");
  }

  function submitRoutine(event: FormEvent) {
    event.preventDefault();
    try {
      setRequest(buildAnalysisRequest({ propertyAddress, preset, anchors, timeLens }));
      setErrors({});
      setStep("review");
    } catch (error) {
      if (error instanceof OnboardingDraftError) setErrors(error.fieldErrors);
      else throw error;
    }
  }

  function openDemo() {
    setPropertyAddress(savedDemoRequest.property.address);
    setPreset("student");
    setTimeLens(true);
    setAnchors(savedDemoRequest.anchors.map((anchor) => ({
      ...anchor,
      visitsPerWeek: String(anchor.visitsPerWeek),
      maxTravelMinutes: String(anchor.maxTravelMinutes),
    })));
    setRequest(savedDemoRequest);
    setErrors({});
    setAnalysisError(undefined);
    setUsingDemo(true);
    setReport(decodedReportFixture);
    setStep("report");
  }

  async function analyse() {
    if (!request) return;
    setAnalysisError(undefined);
    setStep("analysing");

    try {
      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(request),
      });
      const payload: unknown = await response.json();
      if (!response.ok || !isAddressTruthReport(payload)) {
        throw new Error(
          payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "We could not complete this address analysis. Please try again.",
        );
      }
      setUsingDemo(false);
      setReport(payload);
      setStep("report");
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "We could not complete this address analysis. Please try again.");
      setStep("review");
    }
  }

  if (step === "report" && report) {
    return <AnalysisReport report={report} demo={usingDemo} onEdit={() => setStep("review")} onOpenDemo={openDemo} />;
  }

  if (step === "analysing") {
    return (
      <section aria-live="polite" className="relative min-h-[27rem] overflow-hidden p-6 sm:p-8 lg:p-9">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-moss/[0.035]" aria-hidden="true" />
        <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-moss">Analysing your routine</p>
        <h2 className="font-editorial mt-4 max-w-xl text-4xl font-medium leading-[1.02] tracking-[-0.04em] sm:text-5xl">Checking the journeys that shape your week</h2>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-ink">Requesting route data and calculating your weekly burden.</p>
        <div className="route-rule mt-10 h-5" aria-hidden="true" />
      </section>
    );
  }

  if (step === "review" && request) {
    return (
      <section className="p-6 sm:p-8 lg:p-9">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-moss">Details ready</p>
          <StepMarker current={3} />
        </div>
        <h2 className="font-editorial mt-3 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">Your weekly routine</h2>
        <p className="mt-2 text-sm text-muted-ink">{request.property.address} · {request.userProfile?.preset}</p>

        <ul className="mt-6 divide-y divide-border border-y border-border">
          {request.anchors.map((anchor, index) => (
            <li key={anchor.id} className="grid gap-2 py-4 sm:grid-cols-[2rem_1fr_auto] sm:items-center sm:gap-4">
              <span className="font-mono text-xs text-moss">{String(index + 1).padStart(2, "0")}</span>
              <strong className="text-sm">{anchor.name}</strong>
              <span className="text-sm text-muted-ink sm:text-right">{anchor.visitsPerWeek} visits/week · {anchor.maxTravelMinutes} min one-way travel limit</span>
            </li>
          ))}
        </ul>

        {analysisError ? (
          <div role="alert" className="mt-5 border-l-2 border-danger bg-danger/5 px-4 py-3 text-sm leading-6 text-danger">
            <p>{analysisError}</p>
            <button type="button" onClick={openDemo} className="mt-2 font-medium underline decoration-danger/30 underline-offset-4">Open saved demo instead</button>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button className="button-secondary" type="button" onClick={() => setStep("routine")}>Edit routine <span aria-hidden="true">←</span></button>
          <button className="button-primary" type="button" onClick={analyse}>Retry analysis <span aria-hidden="true">→</span></button>
        </div>
      </section>
    );
  }

  if (step === "routine") {
    return (
      <section className="p-6 sm:p-8 lg:p-9">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-ink">Step 02</p>
          <StepMarker current={2} />
        </div>
        <h2 className="font-editorial mt-3 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">Add the places that shape your week</h2>
        <p className="mt-2 text-sm leading-6 text-muted-ink">{propertyAddress.trim()} · add up to four destinations.</p>

        <form className="mt-6 space-y-6" noValidate onSubmit={submitRoutine}>
          <div>
            <label className="block text-sm font-semibold" htmlFor="preset">Your routine</label>
            <select id="preset" className="form-control mt-2" value={preset} onChange={(event) => setPreset(event.target.value as UserPreset)}>
              {presets.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            {anchors.map((anchor, index) => (
              <fieldset key={anchor.id} className="border border-border bg-paper p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                  <legend className="text-sm font-semibold">Regular place {index + 1}</legend>
                  {anchors.length > 1 ? (
                    <button type="button" onClick={() => removeAnchor(index)} className="text-xs font-medium text-danger underline decoration-danger/30 underline-offset-4">Remove this place</button>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium" htmlFor={`name-${anchor.id}`}>Place name</label>
                    <input id={`name-${anchor.id}`} className="form-control mt-1.5" value={anchor.name} onChange={(event) => updateAnchor(index, "name", event.target.value)} />
                    <FieldError message={errors[`anchors.${index}.name`]} />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor={`address-${anchor.id}`}>Destination address</label>
                    <input id={`address-${anchor.id}`} className="form-control mt-1.5" value={anchor.address} onChange={(event) => updateAnchor(index, "address", event.target.value)} />
                    <FieldError message={errors[`anchors.${index}.address`]} />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor={`category-${anchor.id}`}>Category</label>
                    <select id={`category-${anchor.id}`} className="form-control mt-1.5" value={anchor.category} onChange={(event) => updateAnchor(index, "category", event.target.value)}>
                      {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium" htmlFor={`visits-${anchor.id}`}>Visits/week</label>
                      <input id={`visits-${anchor.id}`} className="form-control mt-1.5" type="number" min="1" value={anchor.visitsPerWeek} onChange={(event) => updateAnchor(index, "visitsPerWeek", event.target.value)} />
                      <FieldError message={errors[`anchors.${index}.visitsPerWeek`]} />
                    </div>
                    <div>
                      <label className="text-sm font-medium" htmlFor={`limit-${anchor.id}`}>Max one-way travel time</label>
                      <p id={`limit-help-${anchor.id}`} className="mt-1 text-xs leading-5 text-muted-ink">Total journey time, including public transport and walking. For example: 35 minutes.</p>
                      <input id={`limit-${anchor.id}`} aria-describedby={`limit-help-${anchor.id}`} className="form-control mt-1.5" type="number" min="1" value={anchor.maxTravelMinutes} onChange={(event) => updateAnchor(index, "maxTravelMinutes", event.target.value)} />
                      <FieldError message={errors[`anchors.${index}.maxTravelMinutes`]} />
                    </div>
                  </div>
                </div>
              </fieldset>
            ))}
          </div>

          {errors.anchors ? <FieldError message={errors.anchors} /> : null}

          <button type="button" disabled={anchors.length === 4} onClick={addAnchor} className="button-secondary w-full border-dashed disabled:cursor-not-allowed disabled:opacity-50">
            Add another regular place ({anchors.length}/4)
            <span aria-hidden="true">+</span>
          </button>

          <label className="flex items-start gap-3 border-y border-border py-4 text-sm leading-6">
            <input className="mt-1 h-4 w-4 accent-[var(--moss)]" type="checkbox" checked={timeLens} onChange={(event) => setTimeLens(event.target.checked)} />
            <span>Compare morning and evening for your most frequent destinations</span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="button-secondary" onClick={() => setStep("property")}>Back <span aria-hidden="true">←</span></button>
            <button type="submit" className="button-primary">Review routine <span aria-hidden="true">→</span></button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden p-6 sm:p-8 lg:p-9">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-moss/[0.035]" aria-hidden="true" />

      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-ink">Step 01</p>
          <StepMarker current={1} />
        </div>

        <h2 className="font-editorial mt-3 text-4xl font-medium leading-[1.02] tracking-[-0.04em] sm:text-[2.75rem]">Start with the address</h2>

        <form className="mt-6" noValidate onSubmit={submitProperty}>
          <label className="text-sm font-semibold" htmlFor="property-address">Potential property</label>
          <input
            id="property-address"
            className="form-control mt-2"
            value={propertyAddress}
            onChange={(event) => setPropertyAddress(event.target.value)}
            autoComplete="street-address"
            aria-invalid={Boolean(propertyError)}
          />
          <FieldError message={propertyError} />
          <button className="button-primary hero-cta mt-5 w-full" type="submit">Continue to your routine <span aria-hidden="true">→</span></button>
        </form>

        <div className="my-5 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-border" />
          <span className="h-2 w-2 rounded-full border border-moss/55 bg-paper" />
          <span className="h-px flex-1 bg-border" />
        </div>

        <button type="button" onClick={openDemo} className="button-secondary w-full">Try the saved demo <span aria-hidden="true">↗</span></button>
        <p className="mt-3 text-sm leading-6 text-muted-ink">Explore a prepared student routine with three regular destinations. Demo results are clearly labelled and never presented as live route data.</p>
      </div>
    </section>
  );
}
