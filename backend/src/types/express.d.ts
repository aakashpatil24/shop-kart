import type { UserDocument } from "../models/user.model.js";

// Augments Express's Request type so `req.user` is known everywhere without
// needing `as any` casts in controllers/middlewares.
declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export { };
