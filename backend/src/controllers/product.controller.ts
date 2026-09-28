import { Request, Response } from "express";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Escapes regex special characters so search terms are treated literally, not as regex.
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, price, stock, category, image } = req.body;

  const product = await Product.create({
    title,
    description,
    price,
    stock,
    category,
    image,
    createdBy: req.user!._id,
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: { product },
  });
});

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = (req.query.page as unknown as number) || 1;
  const limit = (req.query.limit as unknown as number) || 10;
  const { search, category, sort } = req.query as {
    search?: string;
    category?: string;
    sort?: string;
  };

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.title = { $regex: escapeRegex(search), $options: "i" };
  }
  if (category) {
    filter.category = category;
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  };
  const sortOption = sortMap[sort ?? "newest"] ?? sortMap.newest;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    data: {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  res.status(200).json({
    success: true,
    message: "Product fetched successfully",
    data: { product },
  });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  if (Object.keys(req.body).length === 0) {
    throw new ApiError(400, "Request body cannot be empty");
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // only the product's creator may update it
  if (String(product.createdBy) !== String(req.user!._id)) {
    throw new ApiError(403, "You do not have permission to update this product");
  }

  const { title, description, price, stock, category, image } = req.body;
  if (title !== undefined) product.title = title;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (stock !== undefined) product.stock = stock;
  if (category !== undefined) product.category = category;
  if (image !== undefined) product.image = image;

  await product.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: { product },
  });
});

// Called by any authenticated buyer at checkout, not just the product's owner.
// Uses an atomic conditional update so concurrent orders can't push stock negative.
export const decrementStock = asyncHandler(async (req: Request, res: Response) => {
  const { quantity } = req.body;

  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { new: true }
  );

  if (!product) {
    const exists = await Product.exists({ _id: req.params.id });
    if (!exists) {
      throw new ApiError(404, "Product not found");
    }
    throw new ApiError(409, "Not enough stock available");
  }

  res.status(200).json({
    success: true,
    message: "Stock updated successfully",
    data: { product },
  });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // only the product's creator may delete it
  if (String(product.createdBy) !== String(req.user!._id)) {
    throw new ApiError(403, "You do not have permission to delete this product");
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
    data: { id: product._id },
  });
});
