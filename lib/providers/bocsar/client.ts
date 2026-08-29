import { strFromU8, unzipSync } from "fflate";

const BOCSAR_LGA_RANKINGS_URL = "https://bocsar.nsw.gov.au/content/dam/dcj/bocsar/documents/open-datasets/LGA_ranking_for_violent_and_property_offences.xlsx";
const BOCSAR_DATASET_PAGE = "https://bocsar.nsw.gov.au/statistics-dashboards/open-datasets/local-area-rankings.html";

export type BocsarAreaObservation = { offence: string; ratePer100k: number; dataPeriod?: string };
export type BocsarAreaContext = { localGovernmentArea: string; sourceName: string; sourceUrl: string; observations: BocsarAreaObservation[] };
export type SafetyProvider = { getAreaContext(localGovernmentArea: string): Promise<BocsarAreaContext> };
type Fetcher = typeof fetch;

function cleanHeader(value: unknown) { return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function normaliseLga(value: string) { return value.trim().toLowerCase().replace(/\s+\(city\)$/i, ""); }
function parseRate(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") { const parsed = Number(value.replace(/,/g, "").trim()); if (Number.isFinite(parsed)) return parsed; }
  return undefined;
}
function isOfficialBocsarUrl(url: URL) { return url.protocol === "https:" && (url.hostname === "bocsar.nsw.gov.au" || url.hostname === "bocsarblob.blob.core.windows.net"); }
function decodeXml(value: string) { return value.replace(/&(?:amp|lt|gt|quot|apos);/g, (entity) => ({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": "\"", "&apos;": "'" })[entity] ?? entity); }
function columnIndex(reference: string) { return reference.replace(/\d/g, "").split("").reduce((index, character) => index * 26 + character.charCodeAt(0) - 64, 0) - 1; }
function textNodes(xml: string) { return [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((match) => decodeXml(match[1])).join(""); }
function parseSharedStrings(xml?: string) { return xml ? [...xml.matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g)].map((match) => textNodes(match[1])) : []; }

function parseSheetRows(xml: string, sharedStrings: string[]): unknown[][] {
  return [...xml.matchAll(/<row(?:\s[^>]*)?>([\s\S]*?)<\/row>/g)].map((rowMatch) => {
    const row: unknown[] = [];
    for (const cellMatch of rowMatch[1].matchAll(/<c\s+([^>]*)>([\s\S]*?)<\/c>/g)) {
      const reference = /\br="([A-Z]+\d+)"/.exec(cellMatch[1])?.[1];
      if (!reference) continue;
      const index = columnIndex(reference);
      const rawValue = /<v>([\s\S]*?)<\/v>/.exec(cellMatch[2])?.[1];
      const type = /\bt="([^"]+)"/.exec(cellMatch[1])?.[1];
      if (type === "inlineStr") row[index] = textNodes(cellMatch[2]);
      else if (type === "s" && rawValue !== undefined) row[index] = sharedStrings[Number(rawValue)];
      else if (rawValue !== undefined) row[index] = Number.isFinite(Number(rawValue)) ? Number(rawValue) : decodeXml(rawValue);
    }
    return row;
  });
}

function workbookSheets(files: Record<string, Uint8Array>) {
  const workbook = files["xl/workbook.xml"] && strFromU8(files["xl/workbook.xml"]);
  const relationships = files["xl/_rels/workbook.xml.rels"] && strFromU8(files["xl/_rels/workbook.xml.rels"]);
  if (!workbook || !relationships) throw new Error("Official BOCSAR workbook is not in the expected format.");
  const targets = new Map([...relationships.matchAll(/<Relationship\s+[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/>/g)].map((match) => [match[1], match[2]]));
  return [...workbook.matchAll(/<sheet\s+[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/>/g)].flatMap((match) => {
    const target = targets.get(match[2]);
    const path = target?.startsWith("/") ? target.slice(1) : target ? `xl/${target.replace(/^\.\//, "")}` : undefined;
    return path && files[path] ? [{ name: decodeXml(match[1]), xml: strFromU8(files[path]) }] : [];
  });
}

function parseRankingSheet(sheetName: string, rows: unknown[][], requestedLga: string): BocsarAreaObservation[] {
  const headerIndex = rows.findIndex((row) => row.some((cell) => cleanHeader(cell) === "lga of incident"));
  if (headerIndex < 1) return [];
  const header = rows[headerIndex].map(cleanHeader);
  const lgaIndex = header.indexOf("lga of incident");
  const latestRateIndex = header.map((value, index) => (value.replace(/\s/g, "") === "rateper100000population" ? index : -1)).filter((index) => index >= 0).at(-1);
  if (lgaIndex < 0 || latestRateIndex === undefined) return [];
  const period = [...(rows[headerIndex - 1] ?? []).slice(0, latestRateIndex + 1)].reverse().find((value) => typeof value === "string" && value.trim());
  return rows.slice(headerIndex + 1).flatMap((row) => {
    const area = row[lgaIndex]; const rate = parseRate(row[latestRateIndex]);
    return typeof area === "string" && normaliseLga(area) === requestedLga && rate !== undefined
      ? [{ offence: sheetName, ratePer100k: rate, ...(typeof period === "string" ? { dataPeriod: period.trim() } : {}) }] : [];
  });
}

export class BocsarClient implements SafetyProvider {
  constructor(private readonly fetcher: Fetcher = fetch, private readonly workbookUrl = process.env.BOCSAR_LGA_RANKINGS_URL ?? BOCSAR_LGA_RANKINGS_URL) {}
  async getAreaContext(localGovernmentArea: string): Promise<BocsarAreaContext> {
    const url = new URL(this.workbookUrl);
    if (!isOfficialBocsarUrl(url)) throw new Error("BOCSAR safety data must use an official BOCSAR source URL.");
    const response = await this.fetcher(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Official BOCSAR area context is temporarily unavailable.");
    const files = unzipSync(new Uint8Array(await response.arrayBuffer()));
    const sharedStrings = parseSharedStrings(files["xl/sharedStrings.xml"] && strFromU8(files["xl/sharedStrings.xml"]));
    const requestedLga = normaliseLga(localGovernmentArea);
    const observations = workbookSheets(files).flatMap((sheet) => parseRankingSheet(sheet.name, parseSheetRows(sheet.xml, sharedStrings), requestedLga));
    if (observations.length === 0) throw new Error("Official BOCSAR data did not include this local government area.");
    return { localGovernmentArea, sourceName: "NSW BOCSAR local area rankings", sourceUrl: BOCSAR_DATASET_PAGE, observations };
  }
}
