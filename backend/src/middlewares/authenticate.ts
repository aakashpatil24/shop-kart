import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new ApiError(401, "Missing or malformed access token");
    }
    const token = header.slice("Bearer ".length);

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      // frontend's axios interceptor checks this code to decide whether to refresh
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, "Access token expired", [], "TOKEN_EXPIRED");
      }
      throw new ApiError(401, "Invalid access token");
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new ApiError(401, "User no longer exists");
    }

    req.user = user;
    next();
  }
);
