/**
 * Google Sheets data layer with graceful in-memory fallback.
 *
 * When the required GOOGLE_* env vars are set, data is persisted in a
 * Google Sheet. Otherwise we fall back to an in-memory store so the app
 * still runs during development.
 */
import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";
import type { LabRequest, TestItem, UserRecord } from "./types";
import { DEFAULT_TESTS } from "./tests-seed";

const SHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SA_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SA_KEY_RAW = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

const SHEETS_ENABLED = Boolean(SHEET_ID && SA_EMAIL && SA_KEY_RAW);

const USERS_SHEET = "Users";
const TESTS_SHEET = "Tests";
const REQUESTS_SHEET = "Requests";
const REPORT_CHUNKS_SHEET = "ReportChunks";

const USERS_HEADERS = [
  "id",
  "email",
  "passwordHash",
  "name",
  "phone",
  "role",
  "createdAt",
];
const TESTS_HEADERS = [
  "id",
  "name",
  "category",
  "description",
  "price",
  "duration",
];
const REQUESTS_HEADERS = [
  "id",
  "patientId",
  "patientName",
  "patientPhone",
  "patientEmail",
  "testId",
  "testName",
  "price",
  "status",
  "notes",
  "createdAt",
  "forwardedAt",
  "reportReadyAt",
  "releasedAt",
  "reportDataUrl",
  "reportFileName",
  "reportMime",
  "labNotes",
];
const REPORT_CHUNKS_HEADERS = [
  "requestId",
  "chunkIndex",
  "chunkData",
];

// Max characters per Google Sheets cell (leave some buffer)
const CHUNK_SIZE = 40000;
// Marker prefix stored in reportDataUrl when data is chunked
const CHUNKED_MARKER = "chunked:";

// ---------------- In-memory fallback store ----------------
type MemStore = {
  users: UserRecord[];
  tests: TestItem[];
  requests: LabRequest[];
  reportChunks: Map<string, string[]>; // requestId -> chunks
  initialized: boolean;
};

const g = globalThis as unknown as { __medicareMem?: MemStore };
if (!g.__medicareMem) {
  g.__medicareMem = {
    users: [],
    tests: [...DEFAULT_TESTS],
    requests: [],
    reportChunks: new Map(),
    initialized: true,
  };
}
const mem = g.__medicareMem!;

// ---------------- Google Sheets client ----------------
let _client: sheets_v4.Sheets | null = null;
function getClient(): sheets_v4.Sheets {
  if (_client) return _client;
  const privateKey = (SA_KEY_RAW || "").replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email: SA_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  _client = google.sheets({ version: "v4", auth });
  return _client;
}

async function ensureSheet(title: string, headers: string[]) {
  const sheets = getClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID! });
  const exists = meta.data.sheets?.some((s) => s.properties?.title === title);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID!,
      requestBody: {
        requests: [{ addSheet: { properties: { title } } }],
      },
    });
  }
  // Ensure header row
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID!,
    range: `${title}!1:1`,
  });
  const row = res.data.values?.[0] || [];
  if (row.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID!,
      range: `${title}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    });
  }
}

let _initPromise: Promise<void> | null = null;
async function initSheets() {
  if (!SHEETS_ENABLED) return;
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    await ensureSheet(USERS_SHEET, USERS_HEADERS);
    await ensureSheet(TESTS_SHEET, TESTS_HEADERS);
    await ensureSheet(REQUESTS_SHEET, REQUESTS_HEADERS);
    await ensureSheet(REPORT_CHUNKS_SHEET, REPORT_CHUNKS_HEADERS);
    // Seed tests if empty
    const existing = await readRows(TESTS_SHEET);
    if (existing.length === 0) {
      const values = DEFAULT_TESTS.map((t) => [
        t.id,
        t.name,
        t.category,
        t.description,
        String(t.price),
        t.duration,
      ]);
      await getClient().spreadsheets.values.append({
        spreadsheetId: SHEET_ID!,
        range: `${TESTS_SHEET}!A1`,
        valueInputOption: "RAW",
        requestBody: { values },
      });
    }
  })();
  return _initPromise;
}

async function readRows(sheet: string): Promise<string[][]> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID!,
    range: `${sheet}!A2:Z`,
  });
  return (res.data.values || []) as string[][];
}

async function appendRow(sheet: string, row: (string | number)[]) {
  await getClient().spreadsheets.values.append({
    spreadsheetId: SHEET_ID!,
    range: `${sheet}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [row.map((v) => String(v ?? ""))] },
  });
}

async function appendRows(sheet: string, rows: (string | number)[][]) {
  await getClient().spreadsheets.values.append({
    spreadsheetId: SHEET_ID!,
    range: `${sheet}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: rows.map((row) => row.map((v) => String(v ?? ""))) },
  });
}

async function updateRowById(
  sheet: string,
  headers: string[],
  id: string,
  updates: Record<string, string | number | undefined>
) {
  const rows = await readRows(sheet);
  const idx = rows.findIndex((r) => r[0] === id);
  if (idx === -1) return false;
  const rowNum = idx + 2; // +1 header, +1 1-based
  const current = rows[idx];
  const merged = headers.map((h, i) => {
    if (h in updates) return String(updates[h] ?? "");
    return current[i] ?? "";
  });
  await getClient().spreadsheets.values.update({
    spreadsheetId: SHEET_ID!,
    range: `${sheet}!A${rowNum}`,
    valueInputOption: "RAW",
    requestBody: { values: [merged] },
  });
  return true;
}

function rowToObj<T>(headers: string[], row: string[]): T {
  const obj: Record<string, string> = {};
  headers.forEach((h, i) => {
    obj[h] = row[i] ?? "";
  });
  return obj as T;
}

// ---------------- Report Chunk Helpers ----------------

/**
 * Store report data, chunking it if it exceeds the Google Sheets cell limit.
 * Returns the value to store in the reportDataUrl column.
 */
export async function storeReportData(
  requestId: string,
  dataUrl: string
): Promise<string> {
  if (!SHEETS_ENABLED) {
    // In-memory: store directly, no limit
    mem.reportChunks.set(requestId, [dataUrl]);
    return dataUrl;
  }

  await initSheets();

  // If the data fits in a single cell, store it directly
  if (dataUrl.length <= CHUNK_SIZE) {
    return dataUrl;
  }

  // Data is too large — chunk it
  // First, delete any existing chunks for this request
  await deleteReportChunks(requestId);

  // Split into chunks
  const chunks: string[] = [];
  for (let i = 0; i < dataUrl.length; i += CHUNK_SIZE) {
    chunks.push(dataUrl.substring(i, i + CHUNK_SIZE));
  }

  // Append all chunks as rows
  const chunkRows = chunks.map((chunk, index) => [
    requestId,
    String(index),
    chunk,
  ]);
  await appendRows(REPORT_CHUNKS_SHEET, chunkRows);

  // Return a marker indicating the data is chunked
  return `${CHUNKED_MARKER}${chunks.length}`;
}

/**
 * Retrieve report data, reassembling chunks if necessary.
 */
export async function retrieveReportData(
  requestId: string,
  reportDataUrl: string | undefined
): Promise<string | undefined> {
  if (!reportDataUrl) return undefined;

  if (!SHEETS_ENABLED) {
    // In-memory: check chunks map first
    const chunks = mem.reportChunks.get(requestId);
    if (chunks && chunks.length > 0) return chunks.join("");
    return reportDataUrl;
  }

  // If it's not chunked, return as-is
  if (!reportDataUrl.startsWith(CHUNKED_MARKER)) {
    return reportDataUrl;
  }

  await initSheets();

  // Read all chunk rows and filter by requestId
  const allRows = await readRows(REPORT_CHUNKS_SHEET);
  const chunkRows = allRows
    .filter((r) => r[0] === requestId)
    .sort((a, b) => Number(a[1]) - Number(b[1]));

  if (chunkRows.length === 0) return undefined;

  // Reassemble the data
  return chunkRows.map((r) => r[2] || "").join("");
}

/**
 * Delete existing report chunks for a request (used when replacing a report).
 */
async function deleteReportChunks(requestId: string): Promise<void> {
  if (!SHEETS_ENABLED) {
    mem.reportChunks.delete(requestId);
    return;
  }

  await initSheets();

  const allRows = await readRows(REPORT_CHUNKS_SHEET);
  // Find row indices (0-based from data rows) that match this requestId
  const indicesToDelete: number[] = [];
  allRows.forEach((r, i) => {
    if (r[0] === requestId) indicesToDelete.push(i);
  });

  if (indicesToDelete.length === 0) return;

  // Get the sheet ID for batch update
  const sheets = getClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID! });
  const chunkSheet = meta.data.sheets?.find(
    (s) => s.properties?.title === REPORT_CHUNKS_SHEET
  );
  if (!chunkSheet?.properties?.sheetId && chunkSheet?.properties?.sheetId !== 0)
    return;
  const sheetId = chunkSheet.properties.sheetId;

  // Delete rows from bottom to top to maintain correct indices
  const deleteRequests = indicesToDelete
    .sort((a, b) => b - a)
    .map((idx) => ({
      deleteDimension: {
        range: {
          sheetId,
          dimension: "ROWS",
          startIndex: idx + 1, // +1 for header row
          endIndex: idx + 2,
        },
      },
    }));

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID!,
    requestBody: { requests: deleteRequests },
  });
}

// ---------------- Public API ----------------

export async function listTests(): Promise<TestItem[]> {
  if (!SHEETS_ENABLED) return [...mem.tests];
  try {
    await initSheets();
    const rows = await readRows(TESTS_SHEET);
    if (rows.length === 0) return [...DEFAULT_TESTS];
    return rows.map((r) => {
      const o = rowToObj<Record<string, string>>(TESTS_HEADERS, r);
      return {
        id: o.id,
        name: o.name,
        category: o.category,
        description: o.description,
        price: Number(o.price) || 0,
        duration: o.duration,
      };
    });
  } catch (e) {
    console.error("listTests sheets error, fallback mem:", e);
    return [...mem.tests];
  }
}

export async function findUserByEmail(
  email: string
): Promise<UserRecord | null> {
  const e = email.toLowerCase().trim();
  if (!SHEETS_ENABLED) {
    return mem.users.find((u) => u.email === e) || null;
  }
  try {
    await initSheets();
    const rows = await readRows(USERS_SHEET);
    const row = rows.find((r) => (r[1] || "").toLowerCase() === e);
    if (!row) return null;
    const o = rowToObj<Record<string, string>>(USERS_HEADERS, row);
    return {
      id: o.id,
      email: o.email,
      passwordHash: o.passwordHash,
      name: o.name,
      phone: o.phone,
      role: "patient",
      createdAt: o.createdAt,
    };
  } catch (e) {
    console.error("findUserByEmail sheets error:", e);
    return mem.users.find((u) => u.email === email.toLowerCase()) || null;
  }
}

export async function createUser(user: UserRecord): Promise<void> {
  if (!SHEETS_ENABLED) {
    mem.users.push(user);
    return;
  }
  try {
    await initSheets();
    await appendRow(USERS_SHEET, [
      user.id,
      user.email,
      user.passwordHash,
      user.name,
      user.phone,
      user.role,
      user.createdAt,
    ]);
  } catch (e) {
    console.error("createUser sheets error, fallback mem:", e);
    mem.users.push(user);
  }
}

export async function createRequest(req: LabRequest): Promise<void> {
  if (!SHEETS_ENABLED) {
    mem.requests.unshift(req);
    return;
  }
  try {
    await initSheets();
    await appendRow(REQUESTS_SHEET, [
      req.id,
      req.patientId,
      req.patientName,
      req.patientPhone,
      req.patientEmail,
      req.testId,
      req.testName,
      req.price,
      req.status,
      req.notes || "",
      req.createdAt,
      req.forwardedAt || "",
      req.reportReadyAt || "",
      req.releasedAt || "",
      req.reportDataUrl || "",
      req.reportFileName || "",
      req.reportMime || "",
      req.labNotes || "",
    ]);
  } catch (e) {
    console.error("createRequest sheets error, fallback mem:", e);
    mem.requests.unshift(req);
  }
}

export async function listRequests(filter?: {
  patientId?: string;
  status?: string | string[];
}): Promise<LabRequest[]> {
  let all: LabRequest[] = [];
  if (!SHEETS_ENABLED) {
    all = [...mem.requests];
  } else {
    try {
      await initSheets();
      const rows = await readRows(REQUESTS_SHEET);
      all = rows.map((r) => {
        const o = rowToObj<Record<string, string>>(REQUESTS_HEADERS, r);
        return {
          id: o.id,
          patientId: o.patientId,
          patientName: o.patientName,
          patientPhone: o.patientPhone,
          patientEmail: o.patientEmail,
          testId: o.testId,
          testName: o.testName,
          price: Number(o.price) || 0,
          status: (o.status || "pending") as LabRequest["status"],
          notes: o.notes,
          createdAt: o.createdAt,
          forwardedAt: o.forwardedAt || undefined,
          reportReadyAt: o.reportReadyAt || undefined,
          releasedAt: o.releasedAt || undefined,
          reportDataUrl: o.reportDataUrl || undefined,
          reportFileName: o.reportFileName || undefined,
          reportMime: o.reportMime || undefined,
          labNotes: o.labNotes || undefined,
        };
      });
    } catch (e) {
      console.error("listRequests sheets error, fallback mem:", e);
      all = [...mem.requests];
    }
  }
  if (filter?.patientId) {
    all = all.filter((r) => r.patientId === filter.patientId);
  }
  if (filter?.status) {
    const arr = Array.isArray(filter.status) ? filter.status : [filter.status];
    all = all.filter((r) => arr.includes(r.status));
  }
  // newest first
  all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return all;
}

export async function getRequest(id: string): Promise<LabRequest | null> {
  const all = await listRequests();
  return all.find((r) => r.id === id) || null;
}

export async function updateRequest(
  id: string,
  updates: Partial<LabRequest>
): Promise<LabRequest | null> {
  if (!SHEETS_ENABLED) {
    const idx = mem.requests.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    mem.requests[idx] = { ...mem.requests[idx], ...updates } as LabRequest;
    return mem.requests[idx];
  }
  try {
    await initSheets();
    const plain: Record<string, string | number | undefined> = {};
    (Object.keys(updates) as (keyof LabRequest)[]).forEach((k) => {
      const v = updates[k];
      plain[k as string] = v === undefined ? undefined : (v as string | number);
    });
    const ok = await updateRowById(REQUESTS_SHEET, REQUESTS_HEADERS, id, plain);
    if (!ok) return null;
    return await getRequest(id);
  } catch (e) {
    console.error("updateRequest sheets error:", e);
    return null;
  }
}

export function sheetsStatus() {
  return {
    enabled: SHEETS_ENABLED,
    mode: SHEETS_ENABLED ? "google-sheets" : "in-memory",
  };
}
