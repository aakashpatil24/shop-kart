import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config/env.js";

export interface AccessTokenPayload {
  sub: string; // user id
}

// `jti` makes every issued refresh token (and its hash) unique.
export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export const signAccessToken = (userId: string): string => {
  const payload: AccessTokenPayload = { sub: userId };
  return jwt.sign(payload, config.accessTokenSecret, {
    // Cast needed: @types/jsonwebtoken expects a literal type like "15m",
    // but this comes from a plain string env var.
    expiresIn: config.accessTokenExpiry as jwt.SignOptions["expiresIn"],
  });
};

export const signRefreshToken = (userId: string): string => {
  const payload: RefreshTokenPayload = { sub: userId, jti: crypto.randomUUID() };
  return jwt.sign(payload, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenExpiry as jwt.SignOptions["expiresIn"],
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, config.accessTokenSecret) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, config.refreshTokenSecret) as RefreshTokenPayload;
};

// Only this hash is stored in the DB, never the raw token - same reasoning as
// hashing passwords, so a DB leak can't be replayed as a working session.
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
