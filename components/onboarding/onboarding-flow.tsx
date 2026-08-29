"use client";

import { useEffect, useRef, useState } from "react";
import type { AddressTruthReport, AnalysisRequest, AnchorCategory } from "@/lib/domain/analysis";
import { AnalysisReport } from "@/components/report/analysis-report";
import {
  buildAnalysisRequest,
  OnboardingDraftError,
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

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm leading-5 text-danger">
      {message}
    </p>
  );
}

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("property");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [propertyError, setPropertyError] = useState<string>();
  const [anchorName, setAnchorName] = useState("");
  const [anchorAddress, setAnchorAddress] = useState("");
  const [category, setCategory] = useState<AnchorCategory>("work");
  const [visitsPerWeek, setVisitsPerWeek] = useState("3");
  const [maxTravelMinutes, setMaxTravelMinutes] = useState("45");
  const [routineErrors, setRoutineErrors] = useState<OnboardingErrors>({});
  const [analysisRequest, setAnalysisRequest] = useState<AnalysisRequest>();
  const [report, setReport] = useState<AddressTruthReport>();
  const [analysisError, setAnalysisError] = useState<string>();
  const propertyInputRef = useRef<HTMLInputElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (step !== "property") stepHeadingRef.current?.focus();
  }, [step]);

  function submitProperty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validatePropertyAddress(propertyAddress);
    setPropertyError(error);
    if (error) {
      propertyInputRef.current?.focus();
      return;
    }
    setPropertyAddress(propertyAddress.trim());
    setStep("routine");
  }

  function submitRoutine(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const request = buildAnalysisRequest({
        propertyAddress,
        anchorName,
        anchorAddress,
        category,
        visitsPerWeek,
        maxTravelMinutes,
      });
      setRoutineErrors({});
      setAnalysisRequest(request);
      setStep("review");
    } catch (error) {
      if (error instanceof OnboardingDraftError) {
        setRoutineErrors(error.fieldErrors);
        return;
      }
      throw error;
    }
  }

  async function runAnalysis() {
    if (!analysisRequest) return;
    setAnalysisError(undefined);
    setStep("analysing");
    try {
      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(analysisRequest),
      });
      const payload: unknown = await response.json();
      if (!response.ok || !payload || typeof payload !== "object" || !("property" in payload)) {
        const message = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
          ? payload.error
          : "We could not complete this address analysis. Please try again.";
        throw new Error(message);
      }
      setReport(payload as AddressTruthReport);
      setStep("report");
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "We could not complete this address analysis. Please try again.");
      setStep("review");
    }
  }

  if (step === "report" && report) {
    return <AnalysisReport report={report} onEdit={() => setStep("review")} />;
  }

  if (step === "analysing") {
    return (
      <section aria-live="polite" aria-labelledby="analysis-heading" className="border border-border bg-paper p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-moss">Analysing your routine</p>
        <h2 id="analysis-heading" className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Checking the journeys that shape your week</h2>
        <p className="mt-4 text-sm leading-6 text-muted-ink">We&apos;re requesting route data and calculating travel burden. This can take a moment.</p>
      </section>
    );
  }

  if (step === "routine") {
    return (
      <section aria-labelledby="routine-heading" className="border border-border bg-paper p-6 sm:p-8">
        <div className="flex items-start justify-between gap-6 border-b border-border pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-ink">Step 02</p>
            <h2
              id="routine-heading"
              ref={stepHeadingRef}
              tabIndex={-1}
              className="mt-2 text-2xl font-semibold tracking-[-0.03em] outline-none"
            >
              Add one regular place
            </h2>
          </div>
          <span aria-hidden="true" className="font-mono text-3xl leading-none text-muted-blue">◎</span>
        </div>

        <div className="mt-5 border-l-2 border-moss pl-4">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-ink">From this property</p>
          <p className="mt-1 text-sm font-medium leading-6">{propertyAddress}</p>
        </div>

        <form className="mt-7 space-y-5" noValidate onSubmit={submitRoutine}>
          {Object.keys(routineErrors).length > 0 && (
            <p role="alert" className="border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
              Check the highlighted routine details before continuing.
            </p>
          )}

          <div>
            <label htmlFor="anchor-name" className="block text-sm font-medium">Place name</label>
            <input
              id="anchor-name"
              value={anchorName}
              onChange={(event) => setAnchorName(event.target.value)}
              required
              aria-invalid={Boolean(routineErrors.anchorName)}
              aria-describedby={routineErrors.anchorName ? "anchor-name-error" : undefined}
              placeholder="e.g. University, work or gym"
              className="form-control mt-2"
            />
            <FieldError id="anchor-name-error" message={routineErrors.anchorName} />
          </div>

          <div>
            <label htmlFor="anchor-address" className="block text-sm font-medium">Destination address</label>
            <input
              id="anchor-address"
              value={anchorAddress}
              onChange={(event) => setAnchorAddress(event.target.value)}
              required
              autoComplete="street-address"
              aria-invalid={Boolean(routineErrors.anchorAddress)}
              aria-describedby={routineErrors.anchorAddress ? "anchor-address-error" : undefined}
              placeholder="e.g. University of Sydney, Camperdown NSW"
              className="form-control mt-2"
            />
            <FieldError id="anchor-address-error" message={routineErrors.anchorAddress} />
          </div>

          <div>
            <label htmlFor="anchor-category" className="block text-sm font-medium">What kind of place is it?</label>
            <select
              id="anchor-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as AnchorCategory)}
              aria-invalid={Boolean(routineErrors.category)}
              className="form-control mt-2"
            >
              {categories.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <FieldError id="anchor-category-error" message={routineErrors.category} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="visits-per-week" className="block text-sm font-medium">Visits each week</label>
              <input
                id="visits-per-week"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={visitsPerWeek}
                onChange={(event) => setVisitsPerWeek(event.target.value)}
                required
                aria-invalid={Boolean(routineErrors.visitsPerWeek)}
                aria-describedby={routineErrors.visitsPerWeek ? "visits-error" : undefined}
                className="form-control mt-2"
              />
              <FieldError id="visits-error" message={routineErrors.visitsPerWeek} />
            </div>
            <div>
              <label htmlFor="max-travel-minutes" className="block text-sm font-medium">Maximum minutes</label>
              <input
                id="max-travel-minutes"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={maxTravelMinutes}
                onChange={(event) => setMaxTravelMinutes(event.target.value)}
                required
                aria-invalid={Boolean(routineErrors.maxTravelMinutes)}
                aria-describedby={routineErrors.maxTravelMinutes ? "travel-time-error" : undefined}
                className="form-control mt-2"
              />
              <FieldError id="travel-time-error" message={routineErrors.maxTravelMinutes} />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            <button type="button" onClick={() => setStep("property")} className="button-secondary flex-1">
              Back to property
            </button>
            <button type="submit" className="button-primary flex-1">
              Review details <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </section>
    );
  }

  if (step === "review" && analysisRequest) {
    const anchor = analysisRequest.anchors[0];
    return (
      <section aria-labelledby="review-heading" className="border border-border bg-paper p-6 sm:p-8">
        <div className="flex items-start justify-between gap-6 border-b border-border pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-moss">Details ready</p>
            <h2
              id="review-heading"
              ref={stepHeadingRef}
              tabIndex={-1}
              className="mt-2 text-2xl font-semibold tracking-[-0.03em] outline-none"
            >
              Your first routine is saved
            </h2>
          </div>
          <span aria-hidden="true" className="font-mono text-3xl leading-none text-moss">✓</span>
        </div>

        <dl className="mt-7 divide-y divide-border border-y border-border">
          <div className="py-4">
            <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-ink">Potential property</dt>
            <dd className="mt-1 text-sm font-medium leading-6">{analysisRequest.property.address}</dd>
          </div>
          <div className="py-4">
            <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-ink">Regular place</dt>
            <dd className="mt-1 text-sm font-medium leading-6">{anchor.name} · {anchor.address}</dd>
          </div>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-ink">Weekly visits</dt>
              <dd className="mt-1 text-sm font-medium">{anchor.visitsPerWeek}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-ink">Travel limit</dt>
              <dd className="mt-1 text-sm font-medium">{anchor.maxTravelMinutes} minutes</dd>
            </div>
          </div>
        </dl>

        <div className="mt-6 bg-parchment px-4 py-4">
          <p className="text-sm font-semibold">Ready to check your routine</p>
          <p className="mt-1 text-sm leading-6 text-muted-ink">
            We&apos;ll calculate the route, weekly burden and how it fits your travel preference.
          </p>
        </div>

        {analysisError && <p role="alert" className="mt-5 border border-danger/30 bg-danger/5 px-4 py-3 text-sm leading-6 text-danger">{analysisError}</p>}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => setStep("property")} className="button-secondary">Edit property</button>
          <button type="button" onClick={runAnalysis} className="button-primary">Analyse this address <span aria-hidden="true">→</span></button>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="property-heading" className="border border-border bg-paper p-6 sm:p-8">
      <div className="flex items-start justify-between gap-6 border-b border-border pb-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-ink">Step 01</p>
          <h2 id="property-heading" className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            Start with the address
          </h2>
        </div>
        <span aria-hidden="true" className="font-mono text-3xl leading-none text-muted-blue">⌖</span>
      </div>

      <form className="mt-7" noValidate onSubmit={submitProperty}>
        <label htmlFor="property-address" className="block text-sm font-medium">Potential property</label>
        <p id="property-address-help" className="mt-1 text-sm leading-6 text-muted-ink">
          Enter the rental address you&apos;re considering.
        </p>
        <input
          ref={propertyInputRef}
          id="property-address"
          name="propertyAddress"
          type="text"
          autoComplete="street-address"
          required
          value={propertyAddress}
          onChange={(event) => {
            setPropertyAddress(event.target.value);
            if (propertyError) setPropertyError(undefined);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          aria-invalid={Boolean(propertyError)}
          aria-describedby={propertyError ? "property-address-help property-address-error" : "property-address-help"}
          placeholder="e.g. 42 King Street, Newtown NSW"
          className="form-control mt-4"
        />
        <FieldError id="property-address-error" message={propertyError} />

        <button type="submit" className="button-primary mt-6 w-full">
          <span>Continue to your routine</span><span aria-hidden="true">→</span>
        </button>
      </form>

      <div className="mt-7 grid grid-cols-3 gap-3 border-t border-border pt-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-ink">Analyse</p>
          <p className="mt-1 text-sm font-medium">Real routes</p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-ink">Compare</p>
          <p className="mt-1 text-sm font-medium">Your tolerance</p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-ink">Reveal</p>
          <p className="mt-1 text-sm font-medium">Weekly burden</p>
        </div>
      </div>
    </section>
  );
}
