import type {
  AnalysedAnchor,
  PropertyProfile,
  SafetyContext,
  SafetySource,
} from "@/lib/domain/analysis";
import type { SafetyProvider } from "@/lib/providers/bocsar/client";
import type { LgaProvider } from "@/lib/providers/nsw/lga";

const officialSource = (name: string, url: string, dataPeriod?: string): SafetySource => ({
  label: "official-data",
  name,
  url,
  ...(dataPeriod ? { dataPeriod } : {}),
});

const featureText = {
  "controlled-entry": "This dwelling is described as having controlled building entry; that is a property characteristic, not a prediction about personal safety.",
  intercom: "This dwelling is described as having an intercom; that is a property characteristic, not a prediction about personal safety.",
  "secure-parking": "This dwelling is described as having secure parking; that is a property characteristic, not a prediction about personal safety.",
  "upper-floor": "This dwelling is described as being on an upper floor; that is a property characteristic, not a prediction about personal safety.",
  "street-level-access": "This dwelling is described as having direct street-level access; that is a property characteristic, not a prediction about personal safety.",
} as const;

export async function buildSafetyContext(
  property: PropertyProfile,
  anchors: AnalysedAnchor[],
  provider?: SafetyProvider,
  lgaProvider?: LgaProvider,
): Promise<SafetyContext> {
  const propertyFacts = (property.securityFeatures ?? []).map((item) => ({
    text: featureText[item.feature],
    source: { label: item.source === "listing" ? "listing-derived" : "user-confirmed", name: item.source === "listing" ? "Property listing" : "User-confirmed property detail" } as SafetySource,
  }));
  const routineFacts = anchors
    .filter((anchor) => anchor.route.walkingMinutes > 0)
    .map((anchor) => ({
      text: `${anchor.name} includes ${anchor.route.walkingMinutes} minutes of walking in the analysed route. This is a routine description, not a safety prediction.`,
      source: { label: "addresstruth-heuristic", name: "AddressTruth route analysis" } as SafetySource,
    }));

  const base = {
    property: propertyFacts,
    routine: routineFacts,
    disclaimer: "Area statistics describe recorded incidents in a broad local government area. They do not describe this dwelling, a person’s experience, or the likelihood of an incident.",
  };

  if (!provider) {
    return {
      ...base,
      area: { status: "unavailable", observations: [], message: "Official BOCSAR area context has not been enabled." },
    };
  }
  const resolvedLga = property.localGovernmentArea ?? (property.coordinates && lgaProvider
    ? await lgaProvider.resolveLga(property.coordinates)
    : null);
  if (!resolvedLga) {
    return {
      ...base,
      area: { status: "unavailable", observations: [], message: "Add the local government area to request official BOCSAR area context." },
    };
  }

  try {
    const area = await provider.getAreaContext(resolvedLga);
    return {
      ...base,
      area: {
        status: "available",
        localGovernmentArea: area.localGovernmentArea,
        observations: area.observations.map((observation) => ({
          offence: observation.offence,
          ratePer100k: observation.ratePer100k,
          source: { ...officialSource(area.sourceName, area.sourceUrl, observation.dataPeriod), retrievedAt: area.retrievedAt, freshness: area.freshness },
        })),
      },
    };
  } catch (error) {
    return {
      ...base,
      area: {
        status: "unavailable",
        observations: [],
        message: error instanceof Error ? error.message : "Official BOCSAR area context is temporarily unavailable.",
      },
    };
  }
}
