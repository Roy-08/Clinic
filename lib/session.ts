import type { SessionOptions } from "iron-session";
import type { SessionUser } from "./types";

export interface AppSession {
  destroy(): unknown;
  save(): unknown;
  user?: SessionUser;
}

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_PASSWORD ||
    "dev-only-insecure-password-change-me-please-32chars!!",
  cookieName: "medicare_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};