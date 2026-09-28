import { Router } from "express";
import {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  decrementStock,
  deleteProduct,
} from "../controllers/product.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  createProductValidator,
  updateProductValidator,
  decrementStockValidator,
  listProductsValidator,
  idParamValidator,
} from "../validators/product.validators.js";

const router = Router();

router.post("/", authenticate, createProductValidator, validate, createProduct);
router.get("/", listProductsValidator, validate, listProducts);
router.get("/:id", idParamValidator, validate, getProductById);
router.put("/:id", authenticate, idParamValidator, updateProductValidator, validate, updateProduct);
router.patch("/:id/stock", authenticate, idParamValidator, decrementStockValidator, validate, decrementStock);
router.delete("/:id", authenticate, idParamValidator, validate, deleteProduct);

export default router;
