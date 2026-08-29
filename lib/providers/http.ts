export class ProviderTimeoutError extends Error {}

export async function fetchWithTimeout(
  fetcher: typeof fetch,
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 8_000,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetcher(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) throw new ProviderTimeoutError("The provider did not respond before the timeout.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
