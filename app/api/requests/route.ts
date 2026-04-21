import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createRequest,
  listRequests,
  listTests,
} from "@/lib/sheets";
import type { LabRequest } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (user.role === "patient") {
    const items = await listRequests({ patientId: user.id });
    return NextResponse.json({ requests: items });
  }
  if (user.role === "admin") {
    // Admin sees everything EXCEPT those still only at the lab
    const items = await listRequests();
    return NextResponse.json({ requests: items });
  }
  if (user.role === "mainlab") {
    const items = await listRequests({
      status: ["forwarded", "report_ready", "delivered"],
    });
    return NextResponse.json({ requests: items });
  }
  return NextResponse.json({ requests: [] });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const testId = String(body.testId || "");
    const notes = String(body.notes || "");
    const patientName = String(body.patientName || user.name).trim();
    const patientPhone = String(body.patientPhone || "").trim();

    if (!testId || !patientName || !patientPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const tests = await listTests();
    const test = tests.find((t) => t.id === testId);
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    const reqObj: LabRequest = {
      id: `R${Date.now().toString(36).toUpperCase()}`,
      patientId: user.id,
      patientName,
      patientPhone,
      patientEmail: user.email,
      testId: test.id,
      testName: test.name,
      price: test.price,
      status: "pending",
      notes,
      createdAt: new Date().toISOString(),
    };
    await createRequest(reqObj);
    return NextResponse.json({ ok: true, request: reqObj });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}