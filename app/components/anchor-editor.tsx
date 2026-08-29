"use client";

import { useEffect, useState } from "react";

import type { AnchorCategory } from "@/lib/domain/anchor";

export interface AnchorDraft {
  id: string;
  name: string;
  address: string;
  category: AnchorCategory;
  visitsPerWeek: string;
  maxTravelMinutes: string;
}

const categoryOptions: Array<{
  value: AnchorCategory;
  label: string;
}> = [
  { value: "work", label: "Work" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "social", label: "Social" },
  { value: "exercise", label: "Exercise" },
  { value: "other", label: "Other" },
];

const createAnchor = (id: string): AnchorDraft => ({
  id,
  name: "",
  address: "",
  category: "education",
  visitsPerWeek: "3",
  maxTravelMinutes: "45",
});

interface AnchorEditorProps {
  onChange: (anchors: AnchorDraft[]) => void;
}

export function AnchorEditor({ onChange }: AnchorEditorProps) {
  const [anchors, setAnchors] = useState<AnchorDraft[]>([
    createAnchor("anchor-1"),
  ]);

  useEffect(() => {
    onChange(anchors);
  }, [anchors, onChange]);

  function updateAnchor(
    id: string,
    field: keyof Omit<AnchorDraft, "id">,
    value: string,
  ) {
    setAnchors((current) =>
      current.map((anchor) =>
        anchor.id === id ? { ...anchor, [field]: value } : anchor,
      ),
    );
  }

  function addAnchor() {
    if (anchors.length >= 4) {
      return;
    }

    setAnchors((current) => [
      ...current,
      createAnchor(crypto.randomUUID()),
    ]);
  }

  function removeAnchor(id: string) {
    if (anchors.length === 1) {
      return;
    }

    setAnchors((current) => current.filter((anchor) => anchor.id !== id));
  }

  return (
    <section aria-labelledby="routine-heading">
      <div className="flex items-start justify-between gap-6 border-b border-border pb-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-ink">
            Step 02
          </p>
          <h2
            id="routine-heading"
            className="mt-2 text-2xl font-semibold tracking-[-0.03em]"
          >
            Map your routine
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-ink">
            Add the places that regularly shape your week and what counts as
            an acceptable trip to each one.
          </p>
        </div>

        <span
          aria-hidden="true"
          className="font-mono text-xs uppercase tracking-[0.14em] text-muted-ink"
        >
          {anchors.length}/4
        </span>
      </div>

      <div className="mt-7 space-y-5">
        {anchors.map((anchor, index) => {
          const prefix = `anchor-${anchor.id}`;

          return (
            <fieldset
              key={anchor.id}
              className="border border-border bg-paper p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <legend className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-moss">
                  Destination {String(index + 1).padStart(2, "0")}
                </legend>

                {anchors.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeAnchor(anchor.id)}
                    className="text-xs font-medium text-muted-ink underline decoration-border underline-offset-4 transition-colors hover:text-ink"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="mt-5 grid gap-5">
                <div>
                  <label
                    htmlFor={`${prefix}-name`}
                    className="block text-sm font-medium"
                  >
                    What do you call this place?
                  </label>
                  <input
                    id={`${prefix}-name`}
                    type="text"
                    value={anchor.name}
                    onChange={(event) =>
                      updateAnchor(anchor.id, "name", event.target.value)
                    }
                    placeholder="e.g. University"
                    className="mt-2 w-full border border-border bg-paper px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-muted-ink/60 focus:border-moss"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`${prefix}-address`}
                    className="block text-sm font-medium"
                  >
                    Address
                  </label>
                  <input
                    id={`${prefix}-address`}
                    type="text"
                    autoComplete="street-address"
                    value={anchor.address}
                    onChange={(event) =>
                      updateAnchor(anchor.id, "address", event.target.value)
                    }
                    placeholder="e.g. University of Sydney, Camperdown NSW"
                    className="mt-2 w-full border border-border bg-paper px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-muted-ink/60 focus:border-moss"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor={`${prefix}-category`}
                      className="block text-sm font-medium"
                    >
                      Category
                    </label>
                    <select
                      id={`${prefix}-category`}
                      value={anchor.category}
                      onChange={(event) =>
                        updateAnchor(
                          anchor.id,
                          "category",
                          event.target.value,
                        )
                      }
                      className="mt-2 w-full border border-border bg-paper px-3 py-3 text-sm text-ink outline-none transition-colors focus:border-moss"
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor={`${prefix}-visits`}
                      className="block text-sm font-medium"
                    >
                      Visits / week
                    </label>
                    <input
                      id={`${prefix}-visits`}
                      type="number"
                      min="1"
                      max="14"
                      inputMode="numeric"
                      value={anchor.visitsPerWeek}
                      onChange={(event) =>
                        updateAnchor(
                          anchor.id,
                          "visitsPerWeek",
                          event.target.value,
                        )
                      }
                      className="mt-2 w-full border border-border bg-paper px-3 py-3 text-sm text-ink outline-none transition-colors focus:border-moss"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`${prefix}-tolerance`}
                      className="block text-sm font-medium"
                    >
                      Max trip
                    </label>
                    <div className="relative mt-2">
                      <input
                        id={`${prefix}-tolerance`}
                        type="number"
                        min="5"
                        max="180"
                        step="5"
                        inputMode="numeric"
                        value={anchor.maxTravelMinutes}
                        onChange={(event) =>
                          updateAnchor(
                            anchor.id,
                            "maxTravelMinutes",
                            event.target.value,
                          )
                        }
                        className="w-full border border-border bg-paper px-3 py-3 pr-12 text-sm text-ink outline-none transition-colors focus:border-moss"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-ink">
                        min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addAnchor}
        disabled={anchors.length >= 4}
        className="mt-5 flex w-full items-center justify-between border border-dashed border-moss px-5 py-4 text-left text-sm font-semibold text-moss transition-colors hover:bg-moss/5 disabled:cursor-not-allowed disabled:border-border disabled:text-muted-ink"
      >
        <span>
          {anchors.length >= 4
            ? "Maximum of four destinations"
            : "Add another destination"}
        </span>
        <span aria-hidden="true">{anchors.length >= 4 ? "4/4" : "+"}</span>
      </button>
    </section>
  );
}