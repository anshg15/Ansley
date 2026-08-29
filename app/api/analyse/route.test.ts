import assert from "node:assert/strict";
import test from "node:test";
import { createAnalysePostHandler, POST } from "./route";

const requestBody = {
  property: { address: "1 King Street, Newtown NSW", localGovernmentArea: "Inner West" },
  anchors: [{
    id: "uni",
    name: "University",
    address: "University of Sydney",
    visitsPerWeek: 4,
    maxTravelMinutes: 45,
    category: "education",
  }],
};

function createRequest(body: unknown) {
  return new Request("http://localhost/api/analyse", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("returns a clear 400 response for malformed JSON", async () => {
  const response = await POST(new Request("http://localhost/api/analyse", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{",
  }));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Request body must be valid JSON." });
});

test("returns a complete, provider-independent report through the full API pipeline", async () => {
  const handler = createAnalysePostHandler({
    transportProvider: {
      async analyseJourney(_origin, _destination, anchorId) {
        return { anchorId, durationMinutes: 28, walkingMinutes: 6, transfers: 0, modes: ["Train"] };
      },
    },
    safetyProvider: {
      async getAreaContext(localGovernmentArea) {
        return {
          localGovernmentArea,
          sourceName: "NSW BOCSAR local area rankings",
          sourceUrl: "https://bocsar.nsw.gov.au/statistics-dashboards/open-datasets/local-area-rankings.html",
          observations: [{ offence: "Theft", ratePer100k: 120, dataPeriod: "2025" }],
          retrievedAt: "2026-08-29T00:00:00.000Z",
          freshness: "current",
        };
      },
    },
  });

  const response = await handler(createRequest(requestBody));
  const report = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(report.modules.transport, { status: "available", coverage: "complete", source: "live" });
  assert.deepEqual(report.modules.timeLens, {
    status: "unavailable",
    coverage: "none",
    source: "not-requested",
    message: "Time-based analysis was not requested.",
  });
  assert.deepEqual(report.modules.safety, { status: "available", coverage: "complete", source: "live" });
  assert.equal(report.routes[0].durationMinutes, 28);
  assert.equal(report.safetyContext.area.observations[0].offence, "Theft");
});

test("keeps a partial transport report renderable with explicit coverage metadata", async () => {
  const handler = createAnalysePostHandler({
    transportProvider: {
      async analyseJourney(_origin, _destination, anchorId) {
        if (anchorId === "work") throw new Error("No route found.");
        return { anchorId, durationMinutes: 28, walkingMinutes: 6, transfers: 0, modes: ["Train"] };
      },
    },
  });
  const response = await handler(createRequest({
    ...requestBody,
    anchors: [...requestBody.anchors, {
      id: "work",
      name: "Work",
      address: "Sydney CBD",
      visitsPerWeek: 3,
      maxTravelMinutes: 35,
      category: "work",
    }],
  }));
  const report = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(report.modules.transport, {
    status: "available",
    coverage: "partial",
    source: "live",
    message: "Some destinations could not be analysed with live transport data.",
  });
  assert.equal(report.routes.length, 1);
  assert.equal(report.failedAnchors.length, 1);
  assert.deepEqual(report.modules.safety, {
    status: "unavailable",
    coverage: "none",
    source: "not-enabled",
    message: "Official BOCSAR area context has not been enabled.",
  });
});

test("returns a clear 400 response for an incomplete analysis request", async () => {
  const response = await POST(new Request("http://localhost/api/analyse", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ property: { address: "1 King Street, Newtown NSW" }, anchors: [] }),
  }));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "At least one personal anchor is required." });
});

test("keeps the report usable when live TfNSW configuration is absent", async () => {
  const previousKey = process.env.TFNSW_API_KEY;
  delete process.env.TFNSW_API_KEY;

  try {
    const response = await POST(new Request("http://localhost/api/analyse", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        property: { address: "1 King Street, Newtown NSW" },
        anchors: [{
          id: "uni",
          name: "University",
          address: "University of Sydney",
          visitsPerWeek: 4,
          maxTravelMinutes: 45,
          category: "education",
        }],
      }),
    }));

    const report = await response.json();
    assert.equal(response.status, 200);
    assert.equal(report.routes.length, 0);
    assert.equal(report.modules.transport.status, "unavailable");
    assert.equal(report.safetyContext.area.status, "unavailable");
    assert.equal(report.failedAnchors[0].message, "Live transport analysis is not configured yet.");
  } finally {
    if (previousKey === undefined) delete process.env.TFNSW_API_KEY;
    else process.env.TFNSW_API_KEY = previousKey;
  }
});
