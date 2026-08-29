import type { AddressTruthReport } from "@/lib/domain/analysis";

// These variables include the richer module metadata already present on the
// backend integration branch. Structural typing keeps the fixture compatible
// with the current contract while preserving that metadata for the next merge.
const transportModule = { status: "available", coverage: "complete", source: "live" } as const;
const timeLensModule = { status: "available", coverage: "complete", source: "live" } as const;
const shadowCommuteModule = { status: "available", coverage: "complete", source: "derived" } as const;
const amenitiesModule = {
  status: "unavailable",
  coverage: "none",
  source: "not-enabled",
  message: "Everyday access analysis is not included in this fixture.",
} as const;
const safetyModule = {
  status: "unavailable",
  coverage: "none",
  source: "not-enabled",
  message: "Official area context is unavailable for this fixture.",
} as const;

export const decodedReportFixture = {
  property: {
    address: "18 Carillon Avenue, Newtown NSW 2042",
    rentPerWeek: 720,
    coordinates: { latitude: -33.8928, longitude: 151.1792 },
    dwellingType: "Apartment",
    localGovernmentArea: "City of Sydney",
    securityFeatures: [{ feature: "controlled-entry", source: "user-confirmed" }],
    source: "manual",
  },
  anchors: [
    {
      id: "university",
      name: "University",
      address: "University of Sydney, Camperdown NSW 2050",
      visitsPerWeek: 4,
      maxTravelMinutes: 30,
      category: "education",
      route: {
        anchorId: "university",
        durationMinutes: 18,
        walkingMinutes: 9,
        walkingDistanceMetres: 720,
        transfers: 0,
        modes: ["Walk", "Bus"],
        departureTime: "2026-08-31T08:00:00+10:00",
        arrivalTime: "2026-08-31T08:18:00+10:00",
        alternativeDurationMinutes: 24,
      },
      weeklyTravelMinutes: 144,
      withinTravelTolerance: true,
    },
    {
      id: "work",
      name: "Part-time work",
      address: "200 George Street, Sydney NSW 2000",
      visitsPerWeek: 3,
      maxTravelMinutes: 35,
      category: "work",
      route: {
        anchorId: "work",
        durationMinutes: 38,
        walkingMinutes: 12,
        walkingDistanceMetres: 940,
        transfers: 1,
        modes: ["Walk", "Train"],
        departureTime: "2026-08-31T08:00:00+10:00",
        arrivalTime: "2026-08-31T08:38:00+10:00",
        alternativeDurationMinutes: 51,
      },
      weeklyTravelMinutes: 228,
      withinTravelTolerance: false,
    },
    {
      id: "gym",
      name: "Gym",
      address: "1 Erskineville Road, Erskineville NSW 2043",
      visitsPerWeek: 2,
      maxTravelMinutes: 20,
      category: "exercise",
      route: {
        anchorId: "gym",
        durationMinutes: 14,
        walkingMinutes: 8,
        walkingDistanceMetres: 610,
        transfers: 0,
        modes: ["Walk", "Bus"],
        departureTime: "2026-08-31T18:00:00+10:00",
        arrivalTime: "2026-08-31T18:14:00+10:00",
        alternativeDurationMinutes: 19,
      },
      weeklyTravelMinutes: 56,
      withinTravelTolerance: true,
    },
  ],
  routes: [
    {
      anchorId: "university",
      durationMinutes: 18,
      transportMode: "mixed",
      transfers: 0,
      walkingMinutes: 9,
      weeklyTravelMinutes: 144,
      withinTolerance: true,
      alternatives: [{ durationMinutes: 24, transportMode: "walking", transfers: 0, walkingMinutes: 24 }],
    },
    {
      anchorId: "work",
      durationMinutes: 38,
      transportMode: "mixed",
      transfers: 1,
      walkingMinutes: 12,
      weeklyTravelMinutes: 228,
      withinTolerance: false,
      alternatives: [{ durationMinutes: 51, transportMode: "transit", transfers: 1, walkingMinutes: 9 }],
    },
    {
      anchorId: "gym",
      durationMinutes: 14,
      transportMode: "mixed",
      transfers: 0,
      walkingMinutes: 8,
      weeklyTravelMinutes: 56,
      withinTolerance: true,
      alternatives: [{ durationMinutes: 19, transportMode: "walking", transfers: 0, walkingMinutes: 19 }],
    },
  ],
  failedAnchors: [],
  summary: {
    weeklyTravelMinutes: 428,
    weeklyTravelHours: 7.1,
    analysedAnchors: 3,
  },
  routineFit: {
    percentage: 67,
    passingVisitsPerWeek: 6,
    totalVisitsPerWeek: 9,
    explanation: "67% of your regular weekly destination visits fall within the travel limits you set.",
  },
  insights: [
    {
      id: "weekly-work-burden",
      type: "route",
      title: "Work is your largest weekly travel commitment",
      explanation: "Your three work visits account for just over half of the estimated weekly travel burden.",
      evidence: ["228 of 428 estimated weekly travel minutes", "38 minutes each way"],
      severity: "warning",
    },
    {
      id: "university-within-limit",
      type: "routine-fit",
      title: "University fits comfortably",
      explanation: "The representative journey is 12 minutes inside the limit you set.",
      evidence: ["18-minute journey", "30-minute maximum"],
      severity: "positive",
    },
  ],
  timeLens: [
    {
      anchorId: "university",
      status: "available",
      periods: [
        { id: "weekday-morning", label: "Weekday morning", durationMinutes: 18 },
        { id: "weekday-evening", label: "Weekday evening", durationMinutes: 23 },
      ],
      minDurationMinutes: 18,
      maxDurationMinutes: 23,
      variationMinutes: 5,
    },
    {
      anchorId: "work",
      status: "available",
      periods: [
        { id: "weekday-morning", label: "Weekday morning", durationMinutes: 38 },
        { id: "weekday-evening", label: "Weekday evening", durationMinutes: 44 },
      ],
      minDurationMinutes: 38,
      maxDurationMinutes: 44,
      variationMinutes: 6,
    },
  ],
  shadowCommutes: [
    {
      anchorId: "university",
      level: "low",
      score: 1,
      reasons: ["No transfers", "Nine minutes of walking", "Alternative route is six minutes slower"],
      backupRoute: { status: "available", penaltyMinutes: 6 },
    },
    {
      anchorId: "work",
      level: "medium",
      score: 3,
      reasons: ["One transfer", "Twelve minutes of walking", "Alternative route is thirteen minutes slower"],
      backupRoute: { status: "available", penaltyMinutes: 13 },
    },
  ],
  modules: {
    transport: transportModule,
    timeLens: timeLensModule,
    shadowCommute: shadowCommuteModule,
    amenities: amenitiesModule,
    safety: safetyModule,
  },
  safetyContext: {
    area: {
      status: "unavailable",
      localGovernmentArea: "City of Sydney",
      observations: [],
      message: "Official area context is unavailable for this fixture.",
    },
    property: [
      {
        text: "The renter confirmed that the building has controlled entry.",
        source: { label: "user-confirmed", name: "Renter confirmation" },
      },
    ],
    routine: [
      {
        text: "The work route includes one transfer and a twelve-minute walking component.",
        source: { label: "addresstruth-heuristic", name: "AddressTruth route analysis" },
      },
    ],
    disclaimer: "Safety context describes available evidence and does not label an address safe or unsafe.",
  },
  generatedAt: "2026-08-29T08:30:00.000Z",
} satisfies AddressTruthReport;
