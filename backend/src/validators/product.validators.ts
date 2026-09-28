import { body, param, query } from "express-validator";

// whitelisted so user input never reaches mongoose's .sort() directly
const ALLOWED_SORTS = ["newest", "price_asc", "price_desc"] as const;

export const idParamValidator = [param("id").isMongoId().withMessage("Invalid product id")];

export const createProductValidator = [
  body("title").trim().isLength({ min: 3, max: 100 }).withMessage("Title must be 3-100 characters"),
  body("description")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be 10-2000 characters"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a number >= 0").toFloat(),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be an integer >= 0").toInt(),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
];

// Same rules as create, but optional - an empty body is rejected in the controller
// since express-validator can't easily express "at least one field present".
export const updateProductValidator = [
  body("title").optional().trim().isLength({ min: 3, max: 100 }).withMessage("Title must be 3-100 characters"),
  body("description")
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be 10-2000 characters"),
  body("category").optional().trim().notEmpty().withMessage("Category is required"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a number >= 0").toFloat(),
  body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be an integer >= 0").toInt(),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
];

export const decrementStockValidator = [
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be a positive integer").toInt(),
];

export const listProductsValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be >= 1").toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be 1-100").toInt(),
  query("search").optional().trim().escape(),
  query("category").optional().trim().escape(),
  query("sort")
    .optional()
    .isIn(ALLOWED_SORTS)
    .withMessage(`sort must be one of: ${ALLOWED_SORTS.join(", ")}`),
];
