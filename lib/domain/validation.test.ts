import assert from "node:assert/strict";
import test from "node:test";
import { RequestValidationError, parseAnalysisRequest } from "./validation";

const validRequest = {
  property: {
    address: "1 King Street, Newtown NSW",
    rentPerWeek: 720,
    coordinates: { latitude: -33.897, longitude: 151.179 },
    dwellingType: "Apartment",
    localGovernmentArea: "Inner West",
    securityFeatures: [{ feature: "controlled-entry", source: "listing" }],
    source: "manual",
  },
  userProfile: {
    preset: "custom",
  },
  anchors: [
    {
      id: "uni",
      name: "University",
      address: "University of Sydney",
      visitsPerWeek: 4,
      maxTravelMinutes: 45,
      category: "education",
    },
  ],
  preferences: [],
};

test("accepts the full v1 request shape without dropping property fields", () => {
  assert.deepEqual(parseAnalysisRequest(validRequest), validRequest);
});

test("rejects duplicate anchors and invalid coordinates", () => {
  assert.throws(
    () => parseAnalysisRequest({ ...validRequest, anchors: [validRequest.anchors[0], validRequest.anchors[0]] }),
    RequestValidationError,
  );
  assert.throws(
    () => parseAnalysisRequest({ ...validRequest, property: { ...validRequest.property, coordinates: { latitude: 91, longitude: 151 } } }),
    /outside valid geographic bounds/,
  );
});

test("accepts a capped TimeLens selection and rejects unknown anchors", () => {
  assert.deepEqual(
    parseAnalysisRequest({ ...validRequest, options: { timeLens: { anchorIds: ["uni"], periodIds: ["weekday-morning"] } } }).options,
    { timeLens: { anchorIds: ["uni"], periodIds: ["weekday-morning"] } },
  );
  assert.throws(
    () => parseAnalysisRequest({ ...validRequest, options: { timeLens: { anchorIds: ["unknown"] } } }),
    /can only analyse anchors included/,
  );
});

test("preserves sourced property security facts and rejects unsupported or duplicate claims", () => {
  const request = parseAnalysisRequest(validRequest);
  assert.deepEqual(request.property.securityFeatures, [{ feature: "controlled-entry", source: "listing" }]);
  assert.throws(
    () => parseAnalysisRequest({ ...validRequest, property: { ...validRequest.property, securityFeatures: [{ feature: "controlled-entry", source: "listing" }, { feature: "controlled-entry", source: "user-confirmed" }] } }),
    /must not contain duplicates/,
  );
  assert.throws(
    () => parseAnalysisRequest({ ...validRequest, property: { ...validRequest.property, securityFeatures: [{ feature: "doorman", source: "listing" }] } }),
    /is unsupported/,
  );
});
