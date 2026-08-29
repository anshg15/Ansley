import type { SafetyProvider } from "./bocsar/client";
import type { TransportProvider } from "@/lib/analysis/analyse";

export type ProviderCheckResult = {
  provider: "TfNSW" | "BOCSAR";
  status: "passed" | "skipped" | "failed";
  message: string;
};

function safeMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown provider failure.";
  return message.replace(/apikey\s+\S+|[A-Za-z0-9_-]{24,}/gi, "[redacted]");
}

export async function checkBocsarCompatibility(provider: SafetyProvider): Promise<ProviderCheckResult> {
  try {
    const context = await provider.getAreaContext("Inner West");
    if (context.observations.length === 0) throw new Error("BOCSAR returned no area observations.");
    return { provider: "BOCSAR", status: "passed", message: `Received ${context.observations.length} normalised area observations.` };
  } catch (error) {
    return { provider: "BOCSAR", status: "failed", message: safeMessage(error) };
  }
}

export async function checkTfnswCompatibility(provider: TransportProvider | undefined): Promise<ProviderCheckResult> {
  if (!provider) return { provider: "TfNSW", status: "skipped", message: "TFNSW_API_KEY is not configured; live TfNSW check skipped." };
  try {
    const route = await provider.analyseJourney("1 King Street, Newtown NSW", "University of Sydney", "compatibility");
    if (route.durationMinutes <= 0 || route.walkingMinutes < 0) throw new Error("TfNSW returned an invalid normalised route.");
    return { provider: "TfNSW", status: "passed", message: "Received a normalised route with duration and walking fields." };
  } catch (error) {
    return { provider: "TfNSW", status: "failed", message: safeMessage(error) };
  }
}
