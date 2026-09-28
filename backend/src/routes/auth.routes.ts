import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, refreshToken, logout, me } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
} from "../validators/auth.validators.js";

const router = Router();

// Slows down brute-force credential guessing against login/register specifically.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later" },
});

router.post("/register", authRateLimiter, registerValidator, validate, register);
router.post("/login", authRateLimiter, loginValidator, validate, login);
router.post("/refresh-token", refreshTokenValidator, validate, refreshToken);
// logout is intentionally NOT validated for token presence: it must stay
// idempotent (200) even when the client has no refresh token left.
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);

export default router;
