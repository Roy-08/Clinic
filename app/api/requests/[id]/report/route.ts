import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRequest, updateRequest } from "@/lib/sheets";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

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
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 5MB)" },
      { status: 400 }
    );
  }
  const allowed = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: "Only PDF / PNG / JPG allowed" },
      { status: 400 }
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const base64 = buf.toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  const updated = await updateRequest(id, {
    status: "report_ready",
    reportReadyAt: new Date().toISOString(),
    reportDataUrl: dataUrl,
    reportFileName: file.name,
    reportMime: file.type,
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

  const [, meta] = r.reportDataUrl.split(",");
  const header = r.reportDataUrl.split(",")[0];
  const mime = r.reportMime || header.match(/data:(.*?);/)?.[1] || "application/pdf";
  const buf = Buffer.from(meta, "base64");
  const safeName = (r.reportFileName || `report-${r.id}.pdf`).replace(
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