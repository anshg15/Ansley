import assert from "node:assert/strict";
import test from "node:test";
import { ProviderTimeoutError, fetchWithTimeout } from "./http";

test("aborts a provider request that exceeds its explicit timeout", async () => {
  const slowFetcher: typeof fetch = async (_input, init) => new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
  });
  await assert.rejects(() => fetchWithTimeout(slowFetcher, "https://example.test", {}, 5), ProviderTimeoutError);
});
