import { CookieOptions } from "express";
import { config } from "../config/env.js";

export const REFRESH_COOKIE_NAME = "refreshToken";

// Keep in sync with REFRESH_TOKEN_EXPIRY in .env (default 7d).
export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Shared by login, refresh-token, and logout so the cookie is always
// set/cleared with identical options (mismatched options silently fail to clear it).
export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  // secure: true cross-site cookies require SameSite=None; local http dev uses Lax.
  sameSite: config.nodeEnv === "production" ? "none" : "lax",
  maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  path: "/",
};
