import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { isAxiosError } from "axios";
import { toast } from "../utils/toast";
import { useAuth } from "../context/AuthContext";
import type { ApiErrorResponse } from "../types/api";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ mode: "onChange" });

  const passwordValue = watch("password");

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterFormValues) => {
    setFormError(null);
    try {
      await register(data.name.trim(), data.email, data.password, data.confirmPassword);
      toast.success("Account created! Redirecting to login...");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      if (isAxiosError<ApiErrorResponse>(error) && error.response?.data.errors) {
        // map backend field errors onto react-hook-form's existing error slots
        for (const fieldError of error.response.data.errors) {
          if (
            fieldError.field === "name" ||
            fieldError.field === "email" ||
            fieldError.field === "password" ||
            fieldError.field === "confirmPassword"
          ) {
            setError(fieldError.field, { message: fieldError.message });
          }
        }
        return;
      }
      const message = isAxiosError<ApiErrorResponse>(error)
        ? (error.response?.data.message ?? "Registration failed")
        : "Registration failed";
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
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join thousands of happy shoppers</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl shadow-purple-900/10">
          {formError && (
            <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <span>⚠</span>
              {formError}
            </div>
          )}
          {success && (
            <div className="bg-green-900/20 border border-green-700/50 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <span>✓</span>
              Account created! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">
                Full Name
              </label>
              <input
                type="text"
                {...registerField("name", {
                  required: "Full name is required",
                })}
                placeholder="Rohan Sharma"
                className={`w-full bg-gray-800 border ${errors.name ? "border-red-500" : "border-gray-700"} text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder-gray-600`}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">
                Email Address
              </label>
              <input
                type="email"
                {...registerField("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
                placeholder="rohan@example.com"
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
                  {...registerField("password", {
                    required: "Password is required",
                    pattern: {
                      value: PASSWORD_PATTERN,
                      message:
                        "Min. 8 characters incl. uppercase, lowercase, number & special character",
                    },
                  })}
                  placeholder="Min. 8 characters"
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

            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                {...registerField("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === passwordValue || "Passwords do not match",
                })}
                placeholder="Repeat your password"
                className={`w-full bg-gray-800 border ${errors.confirmPassword ? "border-red-500" : "border-gray-700"} text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder-gray-600`}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={success || isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <UserPlus size={18} />
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
