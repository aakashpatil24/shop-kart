import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { FieldError } from "../utils/ApiError.js";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors: FieldError[] = result.array().map((e) => ({
    field: "path" in e ? e.path : "unknown",
    message: e.msg,
  }));

  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors,
  });
};
