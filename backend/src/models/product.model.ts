import mongoose, { Schema, Document, Model } from "mongoose";

export interface ProductDocument extends Document {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Field names match what the frontend already renders (ProductCard, ProductDetail, CartItem).
const productSchema = new Schema<ProductDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "stock must be an integer",
      },
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
      default: "https://via.placeholder.com/300",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Product: Model<ProductDocument> = mongoose.model<ProductDocument>(
  "Product",
  productSchema
);
