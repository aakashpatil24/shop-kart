import { useDispatch } from "react-redux";
import { setCategory, setSearchQuery } from "../app/features/productSlice";
import useProducts from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";
import { Search, SlidersHorizontal } from "lucide-react";
import type { AppDispatch } from "../app/store";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, categories, selectedCategory, searchQuery, loading, error } =
    useProducts();

  const filteredProducts = items
    .filter((p) =>
      selectedCategory === "all" ? true : p.category === selectedCategory,
    )
    .filter((p) =>
      searchQuery
        ? p.title.toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-14">
        <div className="inline-block bg-purple-600/10 border border-purple-600/20 text-purple-400 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
          ✦ Free Shipping on Orders Over $50
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
          Discover{" "}
          <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Amazing
          </span>{" "}
          <br />
          Products
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Shop the latest trends at unbeatable prices. Quality products
          delivered to your door.
        </p>
      </div>

      <div className="relative max-w-lg mx-auto mb-10">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          className="w-full bg-gray-900 border border-gray-700 text-white rounded-full pl-12 pr-6 py-3.5 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder-gray-600"
        />
      </div>

      <div className="flex gap-3 flex-wrap justify-center mb-12">
        <div className="flex items-center gap-2 text-gray-500 mr-2">
          <SlidersHorizontal size={16} />
          <span className="text-sm">Filter:</span>
        </div>
        <button
          onClick={() => dispatch(setCategory("all"))}
          className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all ${
            selectedCategory === "all"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          All Products
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => dispatch(setCategory(cat))}
            className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all ${
              selectedCategory === cat
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {!loading && (
        <p className="text-gray-500 text-sm mb-6">
          Showing{" "}
          <span className="text-white font-medium">
            {filteredProducts.length}
          </span>{" "}
          products
          {selectedCategory !== "all" && (
            <span>
              {" "}
              in{" "}
              <span className="text-purple-400 capitalize">
                {selectedCategory}
              </span>
            </span>
          )}
        </p>
      )}

      {error && (
        <div className="text-center py-16 text-red-400">
          <p className="text-4xl mb-4">⚠</p>
          <p>Failed to load products. Please try again.</p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800"
            >
              <div className="h-52 bg-gray-800 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-gray-800 rounded animate-pulse w-1/3" />
                <div className="h-4 bg-gray-800 rounded animate-pulse" />
                <div className="h-4 bg-gray-800 rounded animate-pulse w-2/3" />
                <div className="h-8 bg-gray-800 rounded-lg animate-pulse mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && (
        <>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-gray-400 text-lg">No products found</p>
              <button
                onClick={() => {
                  dispatch(setCategory("all"));
                  dispatch(setSearchQuery(""));
                }}
                className="mt-4 text-purple-400 hover:text-purple-300 text-sm"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
