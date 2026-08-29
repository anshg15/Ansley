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
      <header className="border-b border-border/90 border-t-[3px] border-t-moss-deep bg-parchment/94 backdrop-blur-sm">
        <div className="mx-auto flex h-[4.6rem] w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="group flex items-center gap-3.5" aria-label="Decoded home">
            <span
              aria-hidden="true"
              className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[0.9rem] border border-moss/25 bg-paper shadow-[0_7px_20px_rgba(23,35,29,0.06)] transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-y-0.5 group-hover:border-moss/45 group-hover:shadow-[0_10px_24px_rgba(23,35,29,0.09)]"
            >
              <DecodedHouseMark className="h-9 w-9" />
            </span>
            <span>
              <span className="block font-mono text-[0.69rem] font-semibold uppercase tracking-[0.21em] text-moss-deep">
                Rental intelligence for real life
              </span>
              <span className="mt-0.5 block text-[0.95rem] font-bold tracking-[-0.025em] transition-colors group-hover:text-moss">
                Decoded
              </span>
            </span>
          </Link>

          <a
            href="#analyse"
            className="group hidden items-center gap-2 text-sm font-semibold text-moss-deep md:flex"
          >
            <span className="border-b border-moss/35 pb-0.5 transition-colors group-hover:border-moss-deep">
              Start with the address
            </span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
        </div>
      </header>

      <section
        id="analyse"
        className="mx-auto grid w-full max-w-7xl gap-11 px-5 py-9 sm:px-8 sm:py-11 lg:min-h-[calc(100svh-4.6rem)] lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:gap-16 lg:px-10 lg:py-9 xl:gap-20"
      >
        <div className="relative lg:pr-2">
          <div className="mb-6 flex items-center gap-3 sm:mb-7">
            <span className="h-2 w-2 rounded-full bg-transit-coral shadow-[0_0_0_5px_rgba(217,107,72,0.08)]" aria-hidden="true" />
            <span className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-moss-deep">
              Before the lease becomes your life
            </span>
            <span className="hidden h-px w-14 bg-moss/45 sm:block" aria-hidden="true" />
          </div>

          <h1 className="font-editorial hero-heading max-w-[7.2ch] text-[clamp(4rem,7.1vw,7.15rem)] font-semibold leading-[0.79] tracking-[-0.065em]">
            <span className="block text-emerald-deep">Decode</span>
            <span className="ml-[0.23em] block text-emerald-mid">your life</span>
            <span className="hero-gradient mt-[0.02em] block italic">before you</span>
            <span className="hero-gradient -mt-[0.03em] block italic sm:ml-[0.9em]">sign.</span>
          </h1>

          <p className="mt-7 max-w-[36rem] text-base leading-7 text-muted-ink sm:text-lg sm:leading-8">
            <span className="font-medium text-ink">A rental is more than a bedroom count and weekly price.</span>{" "}
            Decoded checks how an address fits the places you actually need to be,
            every week.
          </p>

          <div className="mt-8 max-w-[36rem] border-l-2 border-moss-deep/70 pl-5 sm:mt-9 sm:pl-6">
            <div className="mb-3 flex items-center gap-2.5" aria-hidden="true">
              <span className="h-1.5 w-1.5 rounded-full bg-transit-coral" />
              <span className="h-px w-12 bg-transit-coral/45" />
            </div>
            <p className="text-sm leading-6 text-muted-ink">
              Add your university, work, gym, partner or other regular
              destinations. We&apos;ll turn the commute into a weekly-life
              picture you can judge before moving.
            </p>
          </div>
        </div>

        <div className="relative lg:translate-y-[0.35rem]">
          <div className="pointer-events-none absolute -left-8 top-12 hidden items-center lg:flex" aria-hidden="true">
            <span className="h-px w-8 bg-moss/55" />
            <span className="h-2.5 w-2.5 rounded-full border-2 border-moss-deep bg-parchment" />
          </div>

          <div className="analysis-shell surface-paper overflow-hidden border border-border-strong/70 bg-paper/97">
            <OnboardingFlow />
          </div>

          <div className="mt-4 flex items-center justify-between gap-5 px-1 font-mono text-[0.63rem] font-semibold uppercase tracking-[0.15em] text-moss-deep/75">
            <span>Potential property</span>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            <span>Every week</span>
          </div>
        </div>
      </section>
    </main>
  );
}
