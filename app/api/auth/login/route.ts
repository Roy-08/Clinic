import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/sheets";
import { checkStaticCreds, getSession } from "@/lib/auth";
import type { Role } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const role = (String(body.role || "patient") as Role);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (role === "admin" || role === "mainlab") {
      const su = checkStaticCreds(email, password, role);
      if (!su) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }
      const session = await getSession();
      session.user = su;
      await session.save();
      return NextResponse.json({ ok: true, user: su });
    }

    // patient
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
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
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}