import { TfnswClient } from "@/lib/providers/tfnsw/client";
import { BocsarClient } from "@/lib/providers/bocsar/client";
import { checkBocsarCompatibility, checkTfnswCompatibility } from "@/lib/providers/compatibility";

async function main() {
  const tfnsw = process.env.TFNSW_API_KEY ? new TfnswClient() : undefined;
  const results = await Promise.all([checkBocsarCompatibility(new BocsarClient()), checkTfnswCompatibility(tfnsw)]);
  for (const result of results) console.log(`${result.provider}: ${result.status} — ${result.message}`);
  if (results.some((result) => result.status === "failed")) process.exitCode = 1;
}

void main();
