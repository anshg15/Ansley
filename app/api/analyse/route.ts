import { createAnalysePostHandler } from "@/lib/analysis/analyse-post-handler";
import { TfnswClient } from "@/lib/providers/tfnsw/client";
import { BocsarClient } from "@/lib/providers/bocsar/client";
import { NswLgaClient } from "@/lib/providers/nsw/lga";

export const runtime = "nodejs";

export const POST = createAnalysePostHandler({
  transportProvider: new TfnswClient(),
  safetyProvider: new BocsarClient(),
  lgaProvider: new NswLgaClient(),
});
