This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Verification

Run the full local verification suite before opening a pull request:

```bash
npm test
npm run lint
npm run build
```

The tests live beside the domain, analysis, provider, and route-handler code. They use mocked TfNSW responses, so they run without API credentials or network access.

## Optional safety context

The analysis response can include a source-labelled Safety Context. The server reads BOCSAR's official LGA rankings workbook and returns only factual area observations (offence and rate per 100,000). It uses a supplied `property.localGovernmentArea` as an explicit override; otherwise, it may resolve validated NSW property coordinates through the official NSW spatial boundary service. It never produces a safe/unsafe score or a prediction about an individual dwelling or person.

Property characteristics must be supplied as sourced facts in `property.securityFeatures`, for example `{ "feature": "controlled-entry", "source": "listing" }`. The optional `BOCSAR_LGA_RANKINGS_URL` override is restricted to official BOCSAR hosts so the adapter remains auditable and removable.

Successful BOCSAR reads are cached server-side for six hours. If a refresh later fails, the response marks the previously retrieved official observations as `stale`; if no data has been retrieved, the Safety Context remains unavailable rather than guessing.

## Optional live provider check

Run `npm run check:providers` before a demo to perform a read-only BOCSAR compatibility check and, when `TFNSW_API_KEY` is configured, a read-only TfNSW route check. The normal test suite and CI remain deterministic and do not call live providers.

## Get live route results locally

The address fields accept normal NSW place or street-address text, for example `1 King Street, Newtown NSW 2042` and `University of Sydney, Camperdown NSW 2050`. Live journey times and Routine Fit require a TfNSW server-side API key:

```bash
cp .env.example .env.local
# Add your key after the equals sign in .env.local:
# TFNSW_API_KEY=your-key
npm run dev
```

Restart the development server after changing `.env.local`, then submit the property and at least one regular destination. Without a key, the report intentionally shows an unavailable state rather than making up travel times or a score; use **Try the saved demo** for a complete, clearly labelled walkthrough.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
