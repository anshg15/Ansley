import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "./route";

test("returns a clear 400 response for malformed JSON", async () => {
  const response = await POST(new Request("http://localhost/api/analyse", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{",
  }));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Request body must be valid JSON." });
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
    assert.equal(report.failedAnchors[0].message, "Live transport analysis is not configured yet.");
  } finally {
    if (previousKey === undefined) delete process.env.TFNSW_API_KEY;
    else process.env.TFNSW_API_KEY = previousKey;
  }
});
