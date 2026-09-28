import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../app/features/cartSlice";
import { useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import { ShoppingBag, Trash2, ArrowRight, Store } from "lucide-react";
import { toast } from "../utils/toast";
import { useAuth } from "../context/AuthContext";
import type { RootState, AppDispatch } from "../app/store";

const Cart = () => {
  const { items } = useSelector((state: RootState) => state.cart);
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12">
          <ShoppingBag size={64} className="text-gray-700 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-400 mb-8">
            Looks like you haven&apos;t added anything yet.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3.5 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            <Store size={18} />
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
          <p className="text-gray-400 mt-1">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </p>
        </div>
        <button
          onClick={() => {
            dispatch(clearCart());
            toast.warning("Cart cleared");
          }}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors hover:bg-red-400/10 px-4 py-2 rounded-lg"
        >
          <Trash2 size={16} />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <p className="text-gray-500 text-sm mb-2">
            {items.length} item{items.length > 1 ? "s" : ""} in your cart
          </p>
          {items.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm mt-4 transition-colors"
          >
            ← Continue Shopping
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>
                  Subtotal (
                  {items.reduce((sum, item) => sum + item.quantity, 0)} items)
                </span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-400">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-700 pt-4 flex justify-between">
                <span className="text-white font-bold text-lg">Total</span>
                <span className="text-white font-bold text-xl">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </button>
          </div>

          {shipping > 0 && (
            <div className="bg-purple-900/20 border border-purple-800/30 rounded-xl p-4 text-sm text-purple-300">
              🚚 Add{" "}
              <span className="font-bold text-white">
                ${(50 - subtotal).toFixed(2)}
              </span>{" "}
              more for free shipping!
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs text-gray-500 flex items-center gap-2">
            🔒 Secure checkout — Your data is encrypted
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
