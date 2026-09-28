import { useDispatch } from "react-redux";
import {
  removeFromCart,
  updateQuantity,
  type CartItem as CartItemType,
} from "../app/features/cartSlice";
import { Trash2, Plus, Minus } from "lucide-react";
import { toast } from "../utils/toast";
import type { AppDispatch } from "../app/store";

const CartItem = ({ item }: { item: CartItemType }) => {
  const dispatch = useDispatch<AppDispatch>();
  const atStockLimit = item.quantity >= item.stock;

  const handleIncrement = () => {
    if (atStockLimit) {
      toast.warning(`Only ${item.stock} in stock`);
      return;
    }
    dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }));
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition-colors">
      <div className="bg-white rounded-xl p-3 w-20 h-20 flex items-center justify-center shrink-0">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium line-clamp-1 mb-1">
          {item.title}
        </p>
        <span className="text-xs text-purple-400 capitalize bg-purple-400/10 px-2 py-0.5 rounded-full">
          {item.category}
        </span>
        <p className="text-gray-400 text-sm mt-2">
          ₹{item.price.toFixed(2)} each
        </p>
        {atStockLimit && (
          <p className="text-amber-400 text-xs mt-1">
            Max stock reached ({item.stock} available)
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            dispatch(
              updateQuantity({ id: item._id, quantity: item.quantity - 1 }),
            )
          }
          className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors"
        >
          <Minus size={14} />
        </button>
        <span className="text-white font-semibold w-8 text-center text-lg">
          {item.quantity}
        </span>
        <button
          onClick={handleIncrement}
          disabled={atStockLimit}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            atStockLimit
              ? "bg-gray-800/50 text-gray-600 cursor-not-allowed"
              : "bg-gray-800 hover:bg-gray-700 text-white"
          }`}
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="text-right min-w-16">
        <p className="text-white font-bold text-lg">
          ₹{(item.price * item.quantity).toFixed(2)}
        </p>
      </div>

      <button
        onClick={() => {
          dispatch(removeFromCart(item._id));
          toast.info("Item removed from cart");
        }}
        className="text-gray-600 hover:text-red-400 transition-colors p-2 hover:bg-red-400/10 rounded-lg"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default CartItem;
