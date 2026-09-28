import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { isAxiosError } from "axios";
import { toast } from "../utils/toast";
import { useAuth } from "../context/AuthContext";
import type { ApiErrorResponse } from "../types/api";

interface LoginFormValues {
  email: string;
  password: string;
}

// state ProtectedRoute attaches on redirect, so we can send the user back afterward
interface LocationState {
  from?: { pathname: string };
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ mode: "onChange" });

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    setFormError(null);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      const state = location.state as LocationState | null;
      navigate(state?.from?.pathname ?? "/");
    } catch (error) {
      // backend sends a generic message on purpose - just surface it as-is
      const message = isAxiosError<ApiErrorResponse>(error)
        ? (error.response?.data.message ?? "Login failed")
        : "Login failed";
      setFormError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="bg-purple-600 p-2 rounded-xl">
              <img src="/cart.svg" alt="ShopCart" className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-white">
              Shop<span className="text-purple-400">Cart</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to continue shopping</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl shadow-purple-900/10">
          {formError && (
            <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <span>⚠</span>
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">
                Email Address
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
                placeholder="john@example.com"
                className={`w-full bg-gray-800 border ${errors.email ? "border-red-500" : "border-gray-700"} text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder-gray-600`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                  })}
                  placeholder="Your password"
                  className={`w-full bg-gray-800 border ${errors.password ? "border-red-500" : "border-gray-700"} text-white rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder-gray-600`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <LogIn size={18} />
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
