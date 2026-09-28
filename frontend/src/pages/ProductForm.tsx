import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { ArrowLeft, Save, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getProductById,
  createProduct,
  updateProduct,
} from "../services/product.service";
import { toast } from "../utils/toast";
import type { ApiErrorResponse, ProductPayload } from "../types/api";

interface ProductFormValues {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

// Shared by create ("/sell") and edit ("/products/:id/edit") - only the submit action differs.
const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditMode);
  const [formError, setFormError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      stock: 0,
      category: "",
      image: "",
    },
  });

  useEffect(() => {
    if (!id) return;
    getProductById(id)
      .then((result) => {
        const product = result.data.product;
        // mirrors the backend's 403 ownership rule
        if (product.createdBy !== user?._id) {
          setForbidden(true);
          return;
        }
        reset({
          title: product.title,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          image: product.image,
        });
      })
      .catch(() => setFormError("Failed to load product."))
      .finally(() => setLoading(false));
  }, [id, user, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    setFormError(null);
    // omit image entirely when blank - backend's isURL() rejects empty strings
    const payload: ProductPayload = {
      title: data.title,
      description: data.description,
      price: data.price,
      stock: data.stock,
      category: data.category,
      ...(data.image && { image: data.image }),
    };

    try {
      if (isEditMode && id) {
        await updateProduct(id, payload);
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product listed successfully");
      }
      navigate("/my-products");
    } catch (error) {
      const message = isAxiosError<ApiErrorResponse>(error)
        ? (error.response?.data.message ?? "Something went wrong")
        : "Something went wrong";
      setFormError(message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 h-96 animate-pulse" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-red-400">
          You do not have permission to edit this product.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate("/my-products")}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to My Products
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl shadow-purple-900/10">
        <div className="flex items-center gap-2 mb-6">
          <Package size={20} className="text-purple-400" />
          <h1 className="text-2xl font-bold text-white">
            {isEditMode ? "Edit Product" : "List a New Product"}
          </h1>
        </div>

        {formError && (
          <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <span>⚠</span>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">
              Title
            </label>
            <input
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Title must be under 100 characters",
                },
              })}
              placeholder="Wireless Headphones"
              className={`w-full bg-gray-800 border ${errors.title ? "border-red-500" : "border-gray-700"} text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder-gray-600`}
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">
              Description
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 10,
                  message: "Description must be at least 10 characters",
                },
                maxLength: {
                  value: 2000,
                  message: "Description must be under 2000 characters",
                },
              })}
              rows={4}
              placeholder="Describe your product..."
              className={`w-full bg-gray-800 border ${errors.description ? "border-red-500" : "border-gray-700"} text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder-gray-600 resize-none`}
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">
                Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("price", {
                  required: "Price is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Price must be 0 or more" },
                })}
                placeholder="1299"
                className={`w-full bg-gray-800 border ${errors.price ? "border-red-500" : "border-gray-700"} text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder-gray-600`}
              />
              {errors.price && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">
                Stock
              </label>
              <input
                type="number"
                {...register("stock", {
                  required: "Stock is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Stock must be 0 or more" },
                  validate: (value) =>
                    Number.isInteger(value) || "Stock must be a whole number",
                })}
                placeholder="10"
                className={`w-full bg-gray-800 border ${errors.stock ? "border-red-500" : "border-gray-700"} text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder-gray-600`}
              />
              {errors.stock && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.stock.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">
              Category
            </label>
            <input
              {...register("category", { required: "Category is required" })}
              placeholder="electronics"
              className={`w-full bg-gray-800 border ${errors.category ? "border-red-500" : "border-gray-700"} text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder-gray-600`}
            />
            {errors.category && (
              <p className="text-red-400 text-xs mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">
              Image URL (optional)
            </label>
            <input
              {...register("image", {
                validate: (value) =>
                  !value ||
                  /^https?:\/\/.+/i.test(value) ||
                  "Enter a valid URL starting with http:// or https://",
              })}
              placeholder="https://example.com/image.jpg"
              className={`w-full bg-gray-800 border ${errors.image ? "border-red-500" : "border-gray-700"} text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder-gray-600`}
            />
            {errors.image && (
              <p className="text-red-400 text-xs mt-1">
                {errors.image.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <Save size={18} />
            {isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Save Changes"
                : "List Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
