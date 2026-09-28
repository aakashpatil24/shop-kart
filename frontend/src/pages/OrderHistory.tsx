import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ShoppingBag } from "lucide-react";
import { loadOrders } from "../utils/orderStorage";
import { useAuth } from "../context/AuthContext";

const OrderHistory = () => {
  const { user } = useAuth();

  const orders = useMemo(() => loadOrders(user?._id), [user?._id]);

  if (!orders.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <ClipboardList size={52} className="text-gray-700 mx-auto mb-5" />
          <h1 className="text-2xl font-bold text-white mb-2">No orders yet</h1>
          <p className="text-gray-400 mb-8">
            Your placed orders will show up here.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <ShoppingBag size={18} />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Order History</h1>

      <div className="space-y-5">
        {orders.map((order) => {
          const itemCount =
            order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
          return (
            <div
              key={order.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <p className="text-sm text-gray-400">Order ID</p>
                  <p className="text-white font-semibold">{order.id}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm text-gray-400">Placed On</p>
                  <p className="text-white font-medium">
                    {new Date(order.placedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {order.items?.map((item) => (
                  <div
                    key={`${order.id}-${item.id}`}
                    className="flex items-center gap-3 bg-gray-800 rounded-xl p-3"
                  >
                    <div className="bg-white rounded-lg p-1.5 w-12 h-12 flex items-center justify-center shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Qty {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-white text-sm font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-gray-400 text-sm">
                  {itemCount} item{itemCount > 1 ? "s" : ""}
                </p>
                <p className="text-white font-bold text-lg">
                  Total: ${order.summary?.total?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistory;
