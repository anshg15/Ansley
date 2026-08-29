import assert from "node:assert/strict";
import test from "node:test";
import { checkBocsarCompatibility, checkTfnswCompatibility } from "./compatibility";

test("skips TfNSW compatibility safely when live credentials are absent", async () => {
  assert.deepEqual(await checkTfnswCompatibility(undefined), { provider: "TfNSW", status: "skipped", message: "TFNSW_API_KEY is not configured; live TfNSW check skipped." });
});

test("checks normalised provider fields and redacts sensitive-looking failure text", async () => {
  assert.equal((await checkBocsarCompatibility({ async getAreaContext() { return { localGovernmentArea: "Inner West", sourceName: "BOCSAR", sourceUrl: "https://bocsar.nsw.gov.au", observations: [{ offence: "Property crime", ratePer100k: 1 }], retrievedAt: "2026-08-29T00:00:00.000Z", freshness: "current" }; } })).status, "passed");
  const result = await checkTfnswCompatibility({ async analyseJourney() { throw new Error("apikey super-secret-token-12345678901234567890 failed"); } });
  assert.equal(result.status, "failed");
  assert.doesNotMatch(result.message, /super-secret/);
});
