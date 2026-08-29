import assert from "node:assert/strict";
import test from "node:test";
import { strToU8, zipSync } from "fflate";
import { BocsarClient } from "./client";

function columnName(index: number) { let result = ""; for (let current = index + 1; current > 0; current = Math.floor((current - 1) / 26)) result = String.fromCharCode(65 + ((current - 1) % 26)) + result; return result; }
function escapeXml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function workbookResponse(sheetName: string, rows: unknown[][]) {
  const sheetRows = rows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, columnIndex) => {
    if (value === undefined || value === null) return "";
    const reference = `${columnName(columnIndex)}${rowIndex + 1}`;
    return typeof value === "string" ? `<c r="${reference}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>` : `<c r="${reference}"><v>${value}</v></c>`;
  }).join("")}</row>`).join("");
  return new Response(zipSync({
    "xl/workbook.xml": strToU8(`<workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`),
    "xl/_rels/workbook.xml.rels": strToU8(`<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>`),
    "xl/worksheets/sheet1.xml": strToU8(`<worksheet><sheetData>${sheetRows}</sheetData></worksheet>`),
  }));
}

test("reads BOCSAR's published ranking-sheet layout and uses its most recent period", async () => {
  BocsarClient.clearCacheForTests();
  const client = new BocsarClient(async () => workbookResponse("Property crime", [["NSW Recorded Crime Statistics"], [], ["Area rankings"], [], [undefined, "Apr 2024 - Mar 2025", undefined, undefined, "Apr 2025 - Mar 2026"], ["LGA of incident", "Count", "Rate per 100,000 population", "Rank", "Count", "Rate per 100,000 population", "Rank"], ["Inner West", 100, 82.1, 20, 120, 93.7, 18]]));
  const context = await client.getAreaContext("Inner West");
  assert.deepEqual(context.observations, [{ offence: "Property crime", ratePer100k: 93.7, dataPeriod: "Apr 2025 - Mar 2026" }]);
});

test("rejects a non-BOCSAR workbook URL", async () => {
  const client = new BocsarClient(async () => workbookResponse("Property crime", []), "https://example.com/data.xlsx");
  await assert.rejects(() => client.getAreaContext("Inner West"), /official BOCSAR source URL/);
});

test("uses fresh cached data and labels expired cached data as stale when refresh fails", async () => {
  BocsarClient.clearCacheForTests();
  let now = new Date("2026-08-29T00:00:00.000Z");
  let calls = 0;
  const client = new BocsarClient(async () => {
    calls += 1;
    return calls === 1
      ? workbookResponse("Property crime", [["Title"], [], ["Area"], [], [undefined, "Apr 2025 - Mar 2026"], ["LGA of incident", "Count", "Rate per 100,000 population"], ["Inner West", 1, 93.7]])
      : new Response(null, { status: 503 });
  }, undefined, { now: () => now, cacheTtlMs: 1_000 });

  assert.equal((await client.getAreaContext("Inner West")).freshness, "current");
  assert.equal((await client.getAreaContext("Inner West")).freshness, "current");
  assert.equal(calls, 1);
  now = new Date("2026-08-29T00:00:02.000Z");
  const stale = await client.getAreaContext("Inner West");
  assert.equal(stale.freshness, "stale");
  assert.equal(stale.retrievedAt, "2026-08-29T00:00:00.000Z");
  assert.equal(calls, 2);
});

test("does not manufacture area context when no cached data exists", async () => {
  BocsarClient.clearCacheForTests();
  const client = new BocsarClient(async () => new Response(null, { status: 503 }));
  await assert.rejects(() => client.getAreaContext("Inner West"), /temporarily unavailable/);
});
