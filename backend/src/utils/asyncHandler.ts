import { Request, Response, NextFunction, RequestHandler } from "express";

// Forwards rejected promises to Express's error handler, so controllers
// don't need try/catch.
export const asyncHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
