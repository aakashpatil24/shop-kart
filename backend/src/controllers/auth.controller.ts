import { Request, Response } from "express";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "../utils/jwt.js";
import {
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_MAX_AGE_MS,
  refreshCookieOptions,
} from "../utils/cookie.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  // password hashing happens in the model's pre('save') hook
  const user = await User.create({ name, email, password });

  // register never issues tokens - the user must log in separately
  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: { user },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    // generic message so we never reveal which field was wrong
    throw new ApiError(401, "Invalid email or password");
  }

  const userId = String(user._id);
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);

  // only the hash is stored, so a DB leak can't be replayed as a session
  user.refreshTokens.push({
    tokenHash: hashToken(refreshToken),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
  });
  await user.save();

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { accessToken, user },
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const rawToken: string | undefined = req.cookies?.[REFRESH_COOKIE_NAME] ?? req.body?.refreshToken;
  if (!rawToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const tokenHash = hashToken(rawToken);
  const storedEntry = user.refreshTokens.find((rt) => rt.tokenHash === tokenHash);

  if (!storedEntry) {
    // Hash not found means this token was already rotated away - likely reuse
    // of a stolen token, so revoke every session for this user as a precaution.
    user.refreshTokens = [];
    await user.save();
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // Rotate: drop the old hash, issue and store a new one.
  const userId = String(user._id);
  const newRefreshToken = signRefreshToken(userId);
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.tokenHash !== tokenHash);
  user.refreshTokens.push({
    tokenHash: hashToken(newRefreshToken),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
  });
  await user.save();

  const newAccessToken = signAccessToken(userId);
  res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions);
  res.status(200).json({
    success: true,
    message: "Access token refreshed",
    data: { accessToken: newAccessToken },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const rawToken: string | undefined = req.cookies?.[REFRESH_COOKIE_NAME] ?? req.body?.refreshToken;

  // idempotent: return 200 even if there's nothing to revoke
  if (rawToken && req.user) {
    const tokenHash = hashToken(rawToken);
    req.user.refreshTokens = req.user.refreshTokens.filter((rt) => rt.tokenHash !== tokenHash);
    await req.user.save();
  }

  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Current user",
    data: { user: req.user },
  });
});
