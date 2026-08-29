"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";
import { ArrowRightIcon, CheckIcon, ClockIcon, RouteIcon } from "@/components/ui/icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const lenses = [
  { name: "Routine Fit", copy: "Your destinations, weighted by how often you actually visit them.", icon: CheckIcon },
  { name: "TimeLens", copy: "A morning and evening view for the journeys that shape your week.", icon: ClockIcon },
  { name: "ShadowCommute", copy: "A transparent read on transfers, walking, and the cost of an alternate route.", icon: RouteIcon },
];

const principles = [
  ["See the commute, not the postcode.", "A useful address is the one that connects your actual week. The places you care about stay at the centre."],
  ["Use your limits, not an average renter's.", "Routine Fit is calculated from the travel tolerance and visit frequency you choose. The trade-off stays visible."],
  ["Keep uncertainty visible.", "When live data is unavailable, the report says so. No hidden confidence score and no invented certainty."],
];

export function MotionStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [activeLens, setActiveLens] = useState(0);
  const [principleIndex, setPrincipleIndex] = useState(0);

  useGSAP(() => {
    const media = gsap.matchMedia();
    const words = gsap.utils.toArray<HTMLElement>(".reveal-word");

    media.add("(min-width: 900px)", () => {
      if (!sectionRef.current || !titleRef.current) return undefined;
      const pin = ScrollTrigger.create({
        trigger: sectionRef.current,
        pin: titleRef.current,
        start: "top top+=96",
        end: "bottom bottom-=96",
        pinSpacing: false,
      });
      return () => pin.kill();
    });

    if (copyRef.current && words.length > 0) {
      gsap.fromTo(words, { opacity: 0.14, y: 8 }, {
        opacity: 1,
        y: 0,
        ease: "none",
        stagger: 0.08,
        scrollTrigger: { trigger: copyRef.current, start: "top 78%", end: "bottom 38%", scrub: true },
      });
    }

    return () => media.revert();
  }, { scope: sectionRef });

  const [quote, body] = principles[principleIndex];

  return (
    <section ref={sectionRef} id="how-it-works" className="border-y border-border bg-paper">
      <div className="mx-auto grid w-full max-w-[94rem] gap-20 px-5 py-28 sm:px-8 md:py-40 lg:grid-cols-[0.7fr_1.3fr] lg:gap-28 lg:px-10">
        <div ref={titleRef} className="self-start">
          <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />The report, made legible</p>
          <h2 className="mt-5 max-w-md font-display text-5xl leading-[0.94] tracking-[-0.055em] sm:text-6xl">Every journey leaves a trace.</h2>
          <p className="mt-6 max-w-sm text-sm leading-6 text-muted-ink">We turn the quiet costs of an address into evidence you can weigh before a lease turns into a routine.</p>
          <a href="#analyse" className="button-secondary mt-8 inline-flex w-auto items-center gap-6">Start with your address <ArrowRightIcon className="h-4 w-4" /></a>
        </div>

        <div className="space-y-28 lg:space-y-40">
          <div ref={copyRef} className="border-l-2 border-transit-coral pl-6 sm:pl-8">
            <p className="max-w-2xl font-display text-3xl leading-[1.08] tracking-[-0.045em] text-ink sm:text-5xl">
              {"A rental listing tells you what the property is. A good decision starts with what your life has to reach from there.".split(" ").map((word, index) => (
                <span className="reveal-word mr-[0.22em] inline-block" key={`${word}-${index}`}>{word}</span>
              ))}
            </p>
          </div>

          <div>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-border pb-4">
              <div>
                <p className="eyebrow">What becomes visible</p>
                <h3 className="mt-3 font-display text-3xl tracking-[-0.04em] sm:text-4xl">The useful details between the pins.</h3>
              </div>
              <p className="max-w-xs text-sm leading-6 text-muted-ink">Three lenses, one honest picture of whether your week can live here.</p>
            </div>
            <div className="flex min-h-[22rem] flex-col gap-2 md:flex-row">
              {lenses.map((lens, index) => {
                const Icon = lens.icon;
                const active = activeLens === index;
                return (
                  <button
                    key={lens.name}
                    type="button"
                    aria-expanded={active}
                    onClick={() => setActiveLens(index)}
                    onMouseEnter={() => setActiveLens(index)}
                    onFocus={() => setActiveLens(index)}
                    className={`group relative flex min-h-20 flex-1 overflow-hidden border p-5 text-left transition-[flex-grow,background-color,color,border-color] duration-500 ease-out md:min-h-0 sm:p-6 ${active ? "flex-[2.4] border-ink bg-ink text-paper" : "border-border bg-parchment hover:flex-[1.25] hover:border-moss"}`}
                  >
                    <span className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-current opacity-10 transition-transform duration-700 ease-out group-hover:scale-125" aria-hidden="true" />
                    <span className="relative flex w-full flex-col justify-between">
                      <span className="flex items-start justify-between"><Icon className={`h-6 w-6 ${active ? "text-transit-coral" : "text-moss"}`} /><span className="font-mono text-xs opacity-60">0{index + 1}</span></span>
                      <span className="mt-10 block"><span className="block font-display text-2xl tracking-[-0.04em]">{lens.name}</span><span className={`mt-3 block max-w-xs text-sm leading-6 ${active ? "text-[#d8e1dc]" : "text-muted-ink md:opacity-0 md:transition-opacity md:duration-300 md:group-hover:opacity-100"}`}>{lens.copy}</span></span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-8 border-t border-border pt-8 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="max-w-xl" aria-live="polite">
              <p className="eyebrow">The Decoded point of view</p>
              <p className="mt-5 font-display text-4xl leading-[0.98] tracking-[-0.05em] sm:text-5xl">“{quote}”</p>
              <p className="mt-5 text-sm leading-6 text-muted-ink">{body}</p>
            </div>
            <div className="flex items-center justify-between gap-6 sm:justify-end"><span className="font-mono text-xs text-muted-ink">0{principleIndex + 1} / 03</span><div className="flex gap-2"><button type="button" className="carousel-button" aria-label="Previous point of view" onClick={() => setPrincipleIndex((current) => (current + principles.length - 1) % principles.length)}>←</button><button type="button" className="carousel-button" aria-label="Next point of view" onClick={() => setPrincipleIndex((current) => (current + 1) % principles.length)}>→</button></div></div>
          </div>
        </div>
      </div>
      <div className="overflow-hidden border-t border-border bg-ink py-4"><div className="marquee-track flex min-w-max items-center gap-10 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#d5dfd9]" aria-hidden="true"><span>actual places</span><span className="text-transit-coral">·</span><span>weekly reality</span><span className="text-transit-coral">·</span><span>your limits</span><span className="text-transit-coral">·</span><span>clear trade-offs</span><span className="text-transit-coral">·</span><span>actual places</span><span className="text-transit-coral">·</span><span>weekly reality</span><span className="text-transit-coral">·</span><span>your limits</span><span className="text-transit-coral">·</span><span>clear trade-offs</span><span className="text-transit-coral">·</span></div><p className="sr-only">AddressTruth analyses actual places, weekly reality, your limits, and clear trade-offs.</p></div>
    </section>
  );
}
