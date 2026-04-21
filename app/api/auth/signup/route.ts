import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "@/lib/sheets";
import { getSession } from "@/lib/auth";
import type { UserRecord } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();

    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user: UserRecord = {
      id: `U${Date.now().toString(36).toUpperCase()}`,
      email,
      passwordHash,
      name,
      phone,
      role: "patient",
      createdAt: new Date().toISOString(),
    };
    await createUser(user);

    const session = await getSession();
    session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: "patient",
    };
    await session.save();

    return NextResponse.json({ ok: true, user: session.user });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}