import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus, PackageSearch } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getProducts, deleteProduct } from "../services/product.service";
import { toast } from "../utils/toast";
import type { Product } from "../types/api";

const MyProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    // no "my products" endpoint - fetch the public list and filter client-side
    getProducts()
      .then((result) => {
        if (!isMounted) return;
        setProducts(result.data.items.filter((p) => p.createdBy === user?._id));
      })
      .catch(() => {
        if (isMounted) setError("Failed to load your products.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`))
      return;
    setDeletingId(product._id);
    try {
      await deleteProduct(product._id);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">My Products</h1>
        <button
          onClick={() => navigate("/sell")}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          List a Product
        </button>
      </div>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-24 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-16 text-red-400">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <PackageSearch size={52} className="text-gray-700 mx-auto mb-5" />
          <h2 className="text-xl font-bold text-white mb-2">No products yet</h2>
          <p className="text-gray-400 mb-8">
            Products you list for sale will show up here.
          </p>
          <button
            onClick={() => navigate("/sell")}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Plus size={18} />
            List Your First Product
          </button>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition-colors"
            >
              <div className="bg-white rounded-xl p-2 w-16 h-16 flex items-center justify-center shrink-0">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${product._id}`}
                  className="text-white text-sm font-medium line-clamp-1 hover:text-purple-400 transition-colors"
                >
                  {product.title}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-purple-400 capitalize bg-purple-400/10 px-2 py-0.5 rounded-full">
                    {product.category}
                  </span>
                  <span className="text-gray-500 text-xs">
                    Stock: {product.stock}
                  </span>
                </div>
              </div>

              <p className="text-white font-bold text-lg">
                ₹{product.price.toFixed(2)}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/products/${product._id}/edit`)}
                  className="w-9 h-9 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  disabled={deletingId === product._id}
                  className="w-9 h-9 bg-gray-800 hover:bg-red-900/40 text-gray-300 hover:text-red-400 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;
