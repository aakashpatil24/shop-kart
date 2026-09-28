import { body } from "express-validator";

const passwordRules = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters")
  .matches(/[a-z]/)
  .withMessage("Password must contain at least one lowercase letter")
  .matches(/[A-Z]/)
  .withMessage("Password must contain at least one uppercase letter")
  .matches(/\d/)
  .withMessage("Password must contain at least one number")
  .matches(/[^A-Za-z0-9]/)
  .withMessage("Password must contain at least one special character");

export const registerValidator = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  passwordRules,
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

export const loginValidator = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// refresh token can arrive via cookie (browser) or body (documented fallback)
export const refreshTokenValidator = [
  body("refreshToken").custom((value, { req }) => {
    if (!value && !req.cookies?.refreshToken) {
      throw new Error("Refresh token is required");
    }
    return true;
  }),
];
