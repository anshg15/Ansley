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
      return Response.json({ locations: [{ id: name === "Origin" ? "101" : "202", type: "stop" }] });
    }
    return Response.json(journeyFixture);
  };

  try {
    const route = await new TfnswClient(fetcher, "https://example.test/v1/tp").analyseJourney("Origin", "Destination", "uni");
    const tripRequest = requests.find((request) => request.url.includes("/trip?"));

    assert.equal(requests.length, 3);
    assert.equal(tripRequest?.headers.get("authorization"), "apikey test-key");
    assert.equal(new URL(tripRequest?.url).searchParams.get("name_origin"), "101");
    assert.equal(new URL(tripRequest?.url).searchParams.get("name_destination"), "202");
    assert.equal(route.durationMinutes, 33);
  } finally {
    if (previousKey === undefined) delete process.env.TFNSW_API_KEY;
    else process.env.TFNSW_API_KEY = previousKey;
  }
});
