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

const categories: Array<{ value: AnchorCategory; label: string }> = [
  { value: "work", label: "Work" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "social", label: "Social" },
  { value: "exercise", label: "Exercise" },
  { value: "other", label: "Other" },
];

const presets: Array<{ value: UserPreset; label: string }> = [
  { value: "student", label: "Student" },
  { value: "professional", label: "Professional" },
  { value: "family", label: "Family" },
  { value: "custom", label: "Custom routine" },
];

const stepNumber: Record<Exclude<Step, "analysing" | "report">, string> = {
  property: "01",
  routine: "02",
  review: "03",
};

function FieldError({ message }: { message?: string }) {
  return message ? <p role="alert" className="mt-1.5 text-sm text-danger">{message}</p> : null;
}

function StepHeader({ step, eyebrow, title, copy }: { step: "property" | "routine" | "review"; eyebrow: string; title: string; copy?: string }) {
  return (
    <div className="border-b border-border pb-6">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-moss">{eyebrow}</p>
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted-ink">Step {stepNumber[step]} / 03</p>
      </div>
      <h2 className="font-editorial mt-3 text-3xl font-medium leading-tight tracking-[-0.035em] sm:text-4xl">{title}</h2>
      {copy ? <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-ink">{copy}</p> : null}
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
      <section aria-live="polite" className="min-h-[32rem] p-6 sm:p-9 lg:p-10">
        <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-moss">Analysis in progress</p>
        <h2 className="font-editorial mt-5 max-w-xl text-4xl font-medium leading-[1.02] tracking-[-0.04em] sm:text-5xl">Tracing the journeys that shape your week.</h2>
        <p className="mt-5 max-w-xl text-sm leading-6 text-muted-ink">We are requesting route data, checking each journey against your stated tolerance and calculating estimated weekly return travel.</p>
        <div className="mt-10 space-y-5 border-t border-border pt-7">
          {["Resolve your property and destinations", "Request available transport routes", "Assemble an explainable routine report"].map((item, index) => (
            <div key={item} className="grid grid-cols-[2rem_1fr] items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-moss/40 bg-moss/5 font-mono text-[0.62rem] text-moss">0{index + 1}</span>
              <span className="text-sm text-muted-ink">{item}</span>
            </div>
          ))}
        </div>
        <p className="mt-9 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-ink">No fake percentage — completion depends on provider response.</p>
      </section>
    );
  }

  if (step === "review" && request) {
    return (
      <section className="p-6 sm:p-9 lg:p-10">
        <StepHeader step="review" eyebrow="Ready to analyse" title="One last check before we trace your week." copy="Review the property and routine below. Your travel limit is a one-way total journey limit, including walking and public transport." />

        <div className="mt-7 border border-border bg-parchment/55 p-5">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-muted-ink">Property</p>
          <p className="mt-2 font-semibold">{request.property.address}</p>
          <p className="mt-1 text-sm capitalize text-muted-ink">{request.userProfile?.preset ?? "custom"} routine</p>
        </div>

        <ol className="mt-5 divide-y divide-border border-y border-border">
          {request.anchors.map((anchor, index) => (
            <li key={anchor.id} className="grid gap-2 py-4 sm:grid-cols-[2rem_1fr_auto] sm:items-center sm:gap-4">
              <span className="font-mono text-xs text-moss">0{index + 1}</span>
              <div>
                <p className="text-sm font-semibold">{anchor.name}</p>
                <p className="mt-1 text-xs leading-5 text-muted-ink">{anchor.address}</p>
              </div>
              <p className="text-sm text-muted-ink sm:text-right">{anchor.visitsPerWeek}× / week · {anchor.maxTravelMinutes} min limit</p>
            </li>
          ))}
        </ol>

        {analysisError ? (
          <div role="alert" className="mt-5 border-l-2 border-danger bg-danger/5 px-4 py-3 text-sm leading-6 text-danger">
            <p>{analysisError}</p>
            <button type="button" onClick={openDemo} className="mt-2 font-semibold underline underline-offset-4">Open the clearly labelled saved demo instead</button>
          </div>
        ) : null}

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button className="button-secondary" type="button" onClick={() => setStep("routine")}>Edit routine <span aria-hidden="true">↙</span></button>
          <button className="button-primary" type="button" onClick={analyse}>Analyse this address <span aria-hidden="true">→</span></button>
        </div>
      </section>
    );
  }

  if (step === "routine") {
    return (
      <section className="p-6 sm:p-9 lg:p-10">
        <StepHeader step="routine" eyebrow="Your life inputs" title="Add the places that shape your week." copy={`${propertyAddress.trim()} · Add one to four regular destinations and tell us what a reasonable one-way journey looks like for each.`} />

        <form className="mt-7 space-y-7" noValidate onSubmit={submitRoutine}>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label className="block text-sm font-semibold" htmlFor="preset">Routine profile</label>
              <p className="mt-1 text-xs leading-5 text-muted-ink">A lightweight preset for context; every destination remains editable.</p>
              <select id="preset" className="form-control mt-2" value={preset} onChange={(event) => setPreset(event.target.value as UserPreset)}>
                {presets.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
            <p className="pb-3 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-ink">{anchors.length} / 4 destinations</p>
          </div>

          <div className="space-y-5">
            {anchors.map((anchor, index) => (
              <fieldset key={anchor.id} className="border border-border bg-paper p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                  <legend className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.17em] text-moss">Destination {String(index + 1).padStart(2, "0")}</legend>
                  {anchors.length > 1 ? <button type="button" onClick={() => removeAnchor(index)} className="text-xs font-semibold text-danger underline decoration-danger/30 underline-offset-4">Remove</button> : null}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium" htmlFor={`name-${anchor.id}`}>Place name</label>
                    <input id={`name-${anchor.id}`} className="form-control mt-1.5" placeholder="e.g. University" value={anchor.name} onChange={(event) => updateAnchor(index, "name", event.target.value)} />
                    <FieldError message={errors[`anchors.${index}.name`]} />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor={`address-${anchor.id}`}>Destination address</label>
                    <input id={`address-${anchor.id}`} className="form-control mt-1.5" placeholder="e.g. University of Sydney, Camperdown NSW" value={anchor.address} onChange={(event) => updateAnchor(index, "address", event.target.value)} />
                    <FieldError message={errors[`anchors.${index}.address`]} />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor={`category-${anchor.id}`}>Category</label>
                    <select id={`category-${anchor.id}`} className="form-control mt-1.5" value={anchor.category} onChange={(event) => updateAnchor(index, "category", event.target.value)}>
                      {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-4 xs:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium" htmlFor={`visits-${anchor.id}`}>Visits / week</label>
                      <input id={`visits-${anchor.id}`} className="form-control mt-1.5" type="number" min="1" value={anchor.visitsPerWeek} onChange={(event) => updateAnchor(index, "visitsPerWeek", event.target.value)} />
                      <FieldError message={errors[`anchors.${index}.visitsPerWeek`]} />
                    </div>
                    <div>
                      <label className="text-sm font-medium" htmlFor={`limit-${anchor.id}`}>One-way limit</label>
                      <input id={`limit-${anchor.id}`} className="form-control mt-1.5" type="number" min="1" aria-describedby={`limit-help-${anchor.id}`} value={anchor.maxTravelMinutes} onChange={(event) => updateAnchor(index, "maxTravelMinutes", event.target.value)} />
                      <p id={`limit-help-${anchor.id}`} className="mt-1 text-[0.68rem] leading-4 text-muted-ink">Minutes, total trip</p>
                      <FieldError message={errors[`anchors.${index}.maxTravelMinutes`]} />
                    </div>
                  </div>
                </div>
              </fieldset>
            ))}
          </div>

          {errors.anchors ? <FieldError message={errors.anchors} /> : null}

          <button type="button" disabled={anchors.length === 4} onClick={addAnchor} className="button-secondary w-full border-dashed disabled:cursor-not-allowed disabled:opacity-50">{anchors.length === 4 ? "Maximum destinations reached" : "Add another regular place"}<span aria-hidden="true">+</span></button>

          <label className="flex items-start gap-3 border-y border-border py-4 text-sm leading-6">
            <input className="mt-1 h-4 w-4 accent-[var(--moss)]" type="checkbox" checked={timeLens} onChange={(event) => setTimeLens(event.target.checked)} />
            <span><strong className="font-semibold">Compare representative times</strong><span className="block text-muted-ink">When available, compare morning and evening journeys for your most frequent destinations.</span></span>
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
    <section className="p-6 sm:p-9 lg:p-10">
      <StepHeader step="property" eyebrow="Start here" title="Which address are you considering?" copy="Use the property you might rent. We will compare it with your real weekly destinations rather than a generic suburb score." />

      <form className="mt-7" noValidate onSubmit={submitProperty}>
        <label className="text-sm font-semibold" htmlFor="property-address">Potential property</label>
        <input
          id="property-address"
          className="form-control mt-2"
          value={propertyAddress}
          onChange={(event) => setPropertyAddress(event.target.value)}
          autoComplete="street-address"
          placeholder="e.g. 1 George Street, Sydney NSW 2000"
          aria-invalid={Boolean(propertyError)}
        />
        <FieldError message={propertyError} />
        <button className="button-primary mt-5 w-full" type="submit">Continue to your routine <span aria-hidden="true">→</span></button>
      </form>

      <div className="my-7 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-muted-ink">or explore first</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <button type="button" onClick={openDemo} className="button-secondary w-full">Open saved student demo <span aria-hidden="true">↗</span></button>
      <p className="mt-3 text-xs leading-5 text-muted-ink">A prepared three-destination scenario. The report is visibly labelled as a saved TfNSW snapshot and is never presented as live data.</p>
    </section>
  );
}
