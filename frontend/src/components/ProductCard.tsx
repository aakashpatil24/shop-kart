import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../app/features/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "../utils/toast";
import type { RootState, AppDispatch } from "../app/store";
import type { Product } from "../types/api";

const ProductCard = ({ product }: { product: Product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items } = useSelector((state: RootState) => state.cart);

  const cartItem = items.find((item) => item._id === product._id);
  const isInCart = Boolean(cartItem);
  const outOfStock = product.stock <= 0;
  const atStockLimit = Boolean(cartItem && cartItem.quantity >= product.stock);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (outOfStock) {
      toast.error("This product is out of stock");
      return;
    }
    if (atStockLimit) {
      toast.warning(`Only ${product.stock} in stock`);
      return;
    }
    dispatch(addToCart(product));
    toast.success("Added to cart");
  };

  return (
    <Link to={`/product/${product._id}`} className="group block h-full">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden h-full flex flex-col hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-900/20 transition-all duration-300">
        <div className="bg-white p-6 h-52 flex items-center justify-center overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        <div className="p-5 flex flex-col flex-1">
          <span className="text-xs text-purple-400 capitalize font-medium mb-2 bg-purple-400/10 px-2 py-0.5 rounded-full w-fit">
            {product.category}
          </span>

          <h3 className="text-white text-sm font-medium line-clamp-2 mb-3 flex-1 leading-relaxed">
            {product.title}
          </h3>

          <div className="flex items-center justify-between mt-auto gap-3">
            <span className="text-white text-xl font-bold">
              ₹{product.price.toFixed(2)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                outOfStock
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : isInCart
                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                    : "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/30"
              }`}
            >
              {outOfStock ? (
                "Out of Stock"
              ) : isInCart ? (
                <>
                  <Check size={14} />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart size={14} />
                  Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
