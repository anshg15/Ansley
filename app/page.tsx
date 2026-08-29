import Link from "next/link";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

function DecodedHouseMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      className={className}
      focusable="false"
    >
      <rect width="64" height="64" rx="16" fill="#FFFDF8" />
      <path d="M12 30.5 32 13l20 17.5V51a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V30.5Z" fill="#426957" />
      <path d="M24 55V39.5a3.5 3.5 0 0 1 3.5-3.5h9a3.5 3.5 0 0 1 3.5 3.5V55H24Z" fill="#F5F1E8" />
      <circle cx="36.5" cy="45.5" r="1.9" fill="#D96B48" />
      <path d="M18 29.5 32 17.3l14 12.2" fill="none" stroke="#29483C" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen text-ink">
      <header className="border-b border-border/90 bg-parchment/92 backdrop-blur-sm">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="group flex items-center gap-3" aria-label="Decoded home">
            <span
              aria-hidden="true"
              className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[0.9rem] border border-moss/25 bg-paper shadow-[0_7px_20px_rgba(23,35,29,0.06)] transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-y-0.5 group-hover:border-moss/45 group-hover:shadow-[0_10px_24px_rgba(23,35,29,0.09)]"
            >
              <DecodedHouseMark className="h-9 w-9" />
            </span>
            <span>
              <span className="block font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-ink">
                Rental intelligence for real life
              </span>
              <span className="mt-0.5 block text-sm font-semibold tracking-[-0.02em] transition-colors group-hover:text-moss">
                Decoded
              </span>
            </span>
          </Link>

          <a
            href="#analyse"
            className="group hidden items-center gap-2 text-sm font-semibold md:flex"
          >
            <span className="border-b border-border pb-0.5 transition-colors group-hover:border-moss">
              Start with the address
            </span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
        </div>
      </header>

      <section
        id="analyse"
        className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-10 sm:px-8 sm:py-12 lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-14 lg:px-10 lg:py-10 xl:gap-20"
      >
        <div className="relative">
          <div className="mb-6 flex items-center gap-3 sm:mb-7">
            <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-moss">
              Before the lease becomes your life
            </span>
            <span className="h-px w-12 bg-moss/45 sm:w-16" aria-hidden="true" />
          </div>

          <h1 className="font-editorial max-w-3xl text-[clamp(4rem,7.2vw,7.2rem)] font-medium leading-[0.82] tracking-[-0.06em]">
            Decode your life
            <span className="block italic text-moss">before you sign.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-muted-ink sm:text-lg sm:leading-8 lg:max-w-xl">
            A rental is more than a bedroom count and weekly price. Decoded
            checks how an address fits the places you actually need to be,
            every week.
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-[auto_1fr] gap-4 border-y border-border py-5 sm:mt-9">
            <div className="pt-1" aria-hidden="true">
              <span className="block h-2.5 w-2.5 rounded-full bg-transit-coral" />
              <span className="mx-auto mt-1 block h-10 w-px bg-border" />
              <span className="mx-auto block h-2 w-2 rounded-full border border-moss bg-parchment" />
            </div>
            <p className="max-w-lg text-sm leading-6 text-muted-ink">
              Add your university, work, gym, partner or other regular
              destinations. We&apos;ll turn the commute into a weekly-life
              picture you can judge before moving.
            </p>
          </div>
        </div>

        <div className="relative lg:translate-y-[-0.25rem]">
          <div className="pointer-events-none absolute -left-7 top-12 hidden items-center lg:flex" aria-hidden="true">
            <span className="h-px w-7 bg-moss/60" />
            <span className="h-2.5 w-2.5 rounded-full border-2 border-moss bg-parchment" />
          </div>

          <div className="surface-paper overflow-hidden border border-border bg-paper/96 ring-1 ring-ink/[0.015]">
            <OnboardingFlow />
          </div>

          <div className="mt-4 flex items-center justify-between gap-5 px-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-ink">
            <span>Potential property</span>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            <span>Every week</span>
          </div>
        </div>
      </section>
    </main>
  );
}
