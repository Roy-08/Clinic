import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRequest, updateRequest } from "@/lib/sheets";
import type { RequestStatus } from "@/lib/types";

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
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user.role === "patient" && r.patientId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // For patient, strip internal lab notes
  if (user.role === "patient") {
    const { labNotes: _labNotes, ...safe } = r;
    void _labNotes;
    return NextResponse.json({ request: safe });
  }
  return NextResponse.json({ request: r });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json();
  const action = String(body.action || "");

  const existing = await getRequest(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date().toISOString();

  if (action === "forward") {
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (existing.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending requests can be forwarded" },
        { status: 400 }
      );
    }
    const updated = await updateRequest(id, {
      status: "forwarded" as RequestStatus,
      forwardedAt: now,
    });
    return NextResponse.json({ ok: true, request: updated });
  }

  if (action === "release") {
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (existing.status !== "report_ready") {
      return NextResponse.json(
        { error: "Report not ready" },
        { status: 400 }
      );
    }
    const updated = await updateRequest(id, {
      status: "delivered" as RequestStatus,
      releasedAt: now,
    });
    return NextResponse.json({ ok: true, request: updated });
  }

  if (action === "reject") {
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const updated = await updateRequest(id, {
      status: "rejected" as RequestStatus,
    });
    return NextResponse.json({ ok: true, request: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}