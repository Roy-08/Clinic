import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { NextResponse } from "next/server";
import { sessionOptions, type AppSession } from "./session";
import type { Role, SessionUser } from "./types";

export async function getSession(): Promise<AppSession> {
  const cookieStore = await cookies();
  const session = await getIronSession<AppSession>(cookieStore, sessionOptions);
  return session;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session.user || null;
}

export async function requireRole(role: Role): Promise<SessionUser | NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (user.role !== role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return user;
}

export async function requireAnyRole(
  roles: Role[]
): Promise<SessionUser | NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!roles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return user;
}

/** Static admin / main-lab credentials via env. */
export function checkStaticCreds(
  email: string,
  password: string,
  role: "admin" | "mainlab"
): SessionUser | null {
  if (role === "admin") {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@medicare.com";
    const adminPass = process.env.ADMIN_PASSWORD || "admin123";
    if (email.toLowerCase() === adminEmail.toLowerCase() && password === adminPass) {
      return {
        id: "admin-static",
        email: adminEmail,
        name: "Clinic Admin",
        role: "admin",
      };
    }
  }
  if (role === "mainlab") {
    const labEmail = process.env.MAINLAB_EMAIL || "lab@medicare.com";
    const labPass = process.env.MAINLAB_PASSWORD || "lab123";
    if (email.toLowerCase() === labEmail.toLowerCase() && password === labPass) {
      return {
        id: "mainlab-static",
        email: labEmail,
        name: "Main Laboratory",
        role: "mainlab",
      };
    }
  }
  return null;
}