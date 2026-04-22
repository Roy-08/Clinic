import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getRequest,
  updateRequest,
  storeReportData,
  retrieveReportData,
} from "@/lib/sheets";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "mainlab") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const existing = await getRequest(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.status !== "forwarded" && existing.status !== "report_ready") {
    return NextResponse.json(
      { error: "Request is not awaiting a report" },
      { status: 400 }
    );
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const labNotes = String(form.get("labNotes") || "");

  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  // No file size limit — any size is accepted
  // No file type restriction — any document type is accepted

  const buf = Buffer.from(await file.arrayBuffer());
  const base64 = buf.toString("base64");
  const mimeType = file.type || "application/octet-stream";
  const fullDataUrl = `data:${mimeType};base64,${base64}`;

  // Store report data with automatic chunking for large files
  const storedValue = await storeReportData(id, fullDataUrl);

  const updated = await updateRequest(id, {
    status: "report_ready",
    reportReadyAt: new Date().toISOString(),
    reportDataUrl: storedValue,
    reportFileName: file.name,
    reportMime: mimeType,
    labNotes,
  });

  return NextResponse.json({ ok: true, request: updated });
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const r = await getRequest(id);
  if (!r || !r.reportDataUrl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Patients can only download when delivered
  if (user.role === "patient") {
    if (r.patientId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (r.status !== "delivered") {
      return NextResponse.json(
        { error: "Report not released yet" },
        { status: 403 }
      );
    }
  }

  // Retrieve the full data URL (reassembles chunks if needed)
  const fullDataUrl = await retrieveReportData(id, r.reportDataUrl);
  if (!fullDataUrl) {
    return NextResponse.json(
      { error: "Report data not found" },
      { status: 404 }
    );
  }

  const [, meta] = fullDataUrl.split(",");
  const header = fullDataUrl.split(",")[0];
  const mime =
    r.reportMime || header.match(/data:(.*?);/)?.[1] || "application/octet-stream";
  const buf = Buffer.from(meta, "base64");
  const safeName = (r.reportFileName || `report-${r.id}`).replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  );

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "no-store",
    },
  });
}
