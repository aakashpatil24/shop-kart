import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { setUser } from "../app/features/cartSlice";
import type { RootState, AppDispatch } from "../app/store";
import {
  ShoppingCart,
  LogOut,
  User,
  Menu,
  X,
  ClipboardList,
  Package,
  PackagePlus,
  Home,
  Info,
} from "lucide-react";
import { toast } from "../utils/toast";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { items } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // keeps the cart's active user in sync with AuthContext (incl. after silent login)
  useEffect(() => {
    dispatch(setUser(user?._id ?? null));
  }, [user, dispatch]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    setUserMenuOpen(false);
    toast.info("Logged out successfully");
    navigate("/");
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold text-white"
        >
          <div className="bg-purple-600 p-1.5 rounded-lg">
            <img src="/cart.svg" alt="ShopCart" className="w-5 h-5" />
          </div>
          Shop<span className="text-purple-400">Cart</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm font-medium transition-colors"
          >
            <Home size={16} />
            Home
          </Link>
          {isAuthenticated && (
            <Link
              to="/my-products"
              className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm font-medium transition-colors"
            >
              <PackagePlus size={16} />
              Sell
            </Link>
          )}
          <Link
            to="/about"
            className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm font-medium transition-colors"
          >
            <Info size={16} />
            About
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-full transition-colors"
                >
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <User size={12} className="text-white" />
                  </div>
                  <span className="text-sm text-gray-300">
                    {user?.name?.split(" ")[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate("/orders");
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <ClipboardList size={16} className="text-purple-400" />
                      Order History
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate("/my-products");
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <Package size={16} className="text-purple-400" />
                      Sell
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate("/sell");
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <PackagePlus size={16} className="text-purple-400" />
                      Sell an Item
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              <Link to="/cart" className="relative group">
                <ShoppingCart
                  size={24}
                  className="text-gray-300 group-hover:text-purple-400 transition-colors"
                />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-300 hover:text-white text-sm transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-gray-400 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-gray-300 hover:text-purple-400"
          >
            <Home size={18} />
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-gray-300 hover:text-purple-400"
          >
            <Info size={18} />
            About
          </Link>
          {isAuthenticated ? (
            <>
              <p className="text-gray-400 text-sm">
                Hi, <span className="text-white font-medium">{user?.name}</span>
              </p>
              <Link
                to="/cart"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-purple-400"
              >
                <ShoppingCart size={18} />
                Cart
                {totalItems > 0 && (
                  <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
              <Link
                to="/orders"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-purple-400"
              >
                <ClipboardList size={18} />
                Order History
              </Link>
              <Link
                to="/my-products"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-purple-400"
              >
                <Package size={18} />
                Sell
              </Link>
              <Link
                to="/sell"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-purple-400"
              >
                <PackagePlus size={18} />
                Sell an Item
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-400 text-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-300 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block bg-purple-600 text-white px-4 py-2 rounded-lg text-center text-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
