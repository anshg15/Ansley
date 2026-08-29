import assert from "node:assert/strict";
import test from "node:test";
import journeyFixture from "@/fixtures/tfnsw-journey.json";
import { TfnswClient } from "./client";

test("uses Stop Finder results to request and normalise a TfNSW trip", async () => {
  const previousKey = process.env.TFNSW_API_KEY;
  process.env.TFNSW_API_KEY = "test-key";
  const requests: Request[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const request = new Request(input, init);
    requests.push(request);
    if (request.url.includes("stop_finder")) {
      const name = new URL(request.url).searchParams.get("name_sf");
      return Response.json({
        locations: [
          {
            id: name === "Origin" ? "101" : "202",
            type: name === "Origin" ? "singlehouse" : "poi",
          },
        ],
      });
    }
    return Response.json(journeyFixture);
  };

  try {
    const client = new TfnswClient(fetcher, "https://example.test/v1/tp");
    const route = await client.analyseJourney("Origin", "Destination", "uni");
    await client.analyseJourneyAt("Origin", "Destination", "uni", {
      date: "2026-08-31", time: "18:00", timeZone: "Australia/Sydney",
    });
    const tripRequests = requests.filter((request) => request.url.includes("/trip?"));
    const tripRequest = tripRequests[0];

    assert.equal(requests.length, 4);
    assert.equal(tripRequest?.headers.get("authorization"), "apikey test-key");
    assert.equal(new URL(tripRequest?.url).searchParams.get("name_origin"), "101");
    assert.equal(new URL(tripRequest?.url).searchParams.get("name_destination"), "202");
    assert.equal(new URL(tripRequest?.url).searchParams.get("type_origin"), "any");
    assert.equal(new URL(tripRequest?.url).searchParams.get("type_destination"), "any");
    assert.equal(new URL(tripRequests[1].url).searchParams.get("itdDate"), "20260831");
    assert.equal(new URL(tripRequests[1].url).searchParams.get("itdTime"), "1800");
    assert.equal(route.durationMinutes, 33);
  } finally {
    if (previousKey === undefined) delete process.env.TFNSW_API_KEY;
    else process.env.TFNSW_API_KEY = previousKey;
  }
});
