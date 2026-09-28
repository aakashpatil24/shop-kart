import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../app/features/cartSlice";
import useProduct from "../hooks/useProduct";
import { ArrowLeft, ShoppingCart, Check, ShoppingBag } from "lucide-react";
import { toast } from "../utils/toast";
import { useAuth } from "../context/AuthContext";
import type { RootState, AppDispatch } from "../app/store";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading } = useProduct(id);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items } = useSelector((state: RootState) => state.cart);

  const isInCart = product && items.some((item) => item._id === product._id);
  const outOfStock = Boolean(product && product.stock <= 0);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.warning("Please log in to add items to your cart");
      navigate("/login");
      return;
    }
    if (!product) return;
    if (outOfStock) {
      toast.error("This product is out of stock");
      return;
    }
    if (!isInCart) {
      dispatch(addToCart(product));
      toast.success(`"${product.title.slice(0, 30)}..." added to cart`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <div className="bg-gray-800 rounded-xl h-80 animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-800 rounded animate-pulse w-1/4" />
            <div className="h-8 bg-gray-800 rounded animate-pulse" />
            <div className="h-8 bg-gray-800 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-800 rounded animate-pulse w-1/3" />
            <div className="space-y-2 mt-6">
              <div className="h-3 bg-gray-800 rounded animate-pulse" />
              <div className="h-3 bg-gray-800 rounded animate-pulse" />
              <div className="h-3 bg-gray-800 rounded animate-pulse w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="bg-white rounded-2xl p-10 flex items-center justify-center min-h-72">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-64 w-full object-contain"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-purple-400 text-sm capitalize font-medium bg-purple-400/10 px-3 py-1 rounded-full w-fit mb-4">
            {product.category}
          </span>

          <h1 className="text-2xl font-bold text-white mb-4 leading-tight">
            {product.title}
          </h1>

          <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-1">
            {product.description}
          </p>

          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-bold text-white">
              ₹{product.price.toFixed(2)}
            </span>
            <span className="text-gray-500 text-sm line-through">
              ₹{(product.price * 1.2).toFixed(2)}
            </span>
            <span className="text-green-400 text-sm font-medium">20% off</span>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`w-full py-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${
                outOfStock
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : isInCart
                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                    : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30"
              }`}
            >
              {outOfStock ? (
                "Out of Stock"
              ) : isInCart ? (
                <>
                  <Check size={18} />
                  Already in Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Add to Cart
                </>
              )}
            </button>

            {isInCart && (
              <button
                onClick={() => navigate("/cart")}
                className="w-full py-4 border border-purple-600/50 text-purple-400 hover:bg-purple-600/10 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                View Cart
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-800">
            <div className="text-center">
              <p className="text-white text-xs font-medium">🚚 Free Delivery</p>
              <p className="text-gray-500 text-xs">Orders over ₹499</p>
            </div>
            <div className="w-px h-8 bg-gray-800" />
            <div className="text-center">
              <p className="text-white text-xs font-medium">🔄 Easy Returns</p>
              <p className="text-gray-500 text-xs">30-day policy</p>
            </div>
            <div className="w-px h-8 bg-gray-800" />
            <div className="text-center">
              <p className="text-white text-xs font-medium">🔒 Secure Pay</p>
              <p className="text-gray-500 text-xs">SSL encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
