import assert from "node:assert/strict";
import test from "node:test";
import { NswLgaClient } from "./lga";

test("resolves an LGA from coordinates using the official NSW spatial service", async () => {
  let requestedUrl = "";
  const client = new NswLgaClient(async (input) => {
    requestedUrl = String(input);
    return Response.json({ features: [{ attributes: { lganame: "Inner West" } }] });
  });
  assert.equal(await client.resolveLga({ latitude: -33.897, longitude: 151.179 }), "Inner West");
  assert.match(requestedUrl, /geometry=151.179%2C-33.897/);
});

test("returns null for missing, out-of-boundary, or failed official responses", async () => {
  const client = new NswLgaClient(async () => Response.json({ features: [] }));
  assert.equal(await client.resolveLga({ latitude: -28, longitude: 153 }), null);
  const unavailable = new NswLgaClient(async () => { throw new Error("offline"); });
  assert.equal(await unavailable.resolveLga({ latitude: -33.897, longitude: 151.179 }), null);
});

test("rejects a non-official boundary endpoint before sending coordinates", async () => {
  const client = new NswLgaClient(async () => Response.json({}), 100, "https://example.com/query");
  await assert.rejects(() => client.resolveLga({ latitude: -33.897, longitude: 151.179 }), /official NSW spatial service/);
});
