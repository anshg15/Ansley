import { analyseAddressTruth } from "@/lib/analysis/analyse";
import { RequestValidationError, parseAnalysisRequest } from "@/lib/domain/validation";
import { TfnswClient } from "@/lib/providers/tfnsw/client";
import { BocsarClient } from "@/lib/providers/bocsar/client";
import { NswLgaClient } from "@/lib/providers/nsw/lga";
import type { TransportProvider } from "@/lib/analysis/analyse";
import type { SafetyProvider } from "@/lib/providers/bocsar/client";
import type { LgaProvider } from "@/lib/providers/nsw/lga";

export const runtime = "nodejs";

export type AnalyseRouteDependencies = {
  transportProvider: TransportProvider;
  safetyProvider?: SafetyProvider;
  lgaProvider?: LgaProvider;
};

export function createAnalysePostHandler({ transportProvider, safetyProvider, lgaProvider }: AnalyseRouteDependencies) {
  return async function POST(request: Request) {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    try {
      const analysisRequest = parseAnalysisRequest(body);
      const report = await analyseAddressTruth(analysisRequest, transportProvider, safetyProvider, lgaProvider);
      return Response.json(report);
    } catch (error) {
      if (error instanceof RequestValidationError) {
        return Response.json({ error: error.message }, { status: 400 });
      }

      console.error("AddressTruth analysis failed", error);
      return Response.json(
        { error: "We could not start your address analysis. Please try again." },
        { status: 500 },
      );
    }
  };
}

export const POST = createAnalysePostHandler({
  transportProvider: new TfnswClient(),
  safetyProvider: new BocsarClient(),
  lgaProvider: new NswLgaClient(),
});
