import { useState } from "react";
import { Controller, useForm, useWatch, type FieldError as RHFFieldError } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  CheckCircle,
  ClipboardList,
  CreditCard,
  Lock,
  MapPin,
} from "lucide-react";
import { clearCart } from "../app/features/cartSlice";
import { saveOrder, type Order } from "../utils/orderStorage";
import { decrementStock } from "../services/product.service";
import { toast } from "../utils/toast";
import { useAuth } from "../context/AuthContext";
import type { RootState, AppDispatch } from "../app/store";
import type { ApiErrorResponse } from "../types/api";

interface CheckoutFormValues {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

const inputClass = (hasError: RHFFieldError | undefined) =>
  `w-full bg-gray-800 border ${
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      : "border-gray-700 focus:border-purple-500 focus:ring-purple-500/30"
  } text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all placeholder-gray-600`;

const labelClass = "block text-sm text-gray-400 mb-2 font-medium";

const FieldError = ({ error }: { error?: RHFFieldError }) =>
  error ? <p className="text-red-400 text-xs mt-1">{error.message}</p> : null;

const Checkout = () => {
  const { items } = useSelector((state: RootState) => state.cart);
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    mode: "onChange",
    defaultValues: {
      firstName: user?.name?.split(" ")[0] || "",
      lastName: user?.name?.split(" ")[1] || "",
      email: user?.email || "",
      address: "",
      city: "",
      state: "",
      zip: "",
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
    },
  });

  const values = useWatch({ control });

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 499 ? 0 : 49;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const shippingFields: (keyof CheckoutFormValues)[] = [
    "firstName",
    "lastName",
    "email",
    "address",
    "city",
    "state",
    "zip",
  ];
  const paymentFields: (keyof CheckoutFormValues)[] = ["cardName", "cardNumber", "expiry", "cvv"];

  const handleContinueToPayment = async () => {
    const isValid = await trigger(shippingFields);
    if (!isValid) {
      toast.error("Please fill in all required shipping fields");
      return;
    }
    setStep(2);
  };

  const handleContinueToReview = async () => {
    const isValid = await trigger(paymentFields);
    if (!isValid) {
      toast.error("Please fill in all payment details correctly");
      return;
    }
    setStep(3);
  };

  const onPlaceOrder = async (data: CheckoutFormValues) => {
    if (!user?._id) {
      toast.error("Please log in again before placing your order");
      navigate("/login");
      return;
    }

    setPlacingOrder(true);
    try {
      // Decrement stock for each item first - if any product ran out in the
      // meantime the order is never saved and the cart is left untouched.
      for (const item of items) {
        await decrementStock(item._id, item.quantity);
      }
    } catch (error) {
      const message = isAxiosError<ApiErrorResponse>(error)
        ? (error.response?.data.message ?? "Failed to update stock")
        : "Failed to update stock";
      toast.error(message);
      setPlacingOrder(false);
      return;
    }

    const order: Order = {
      id: `ORD-${Date.now()}`,
      placedAt: new Date().toISOString(),
      items: items.map((item) => ({
        id: item._id,
        title: item.title,
        image: item.image,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
      })),
      shipping: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
      },
      payment: {
        cardName: data.cardName,
        cardLast4: data.cardNumber.slice(-4),
        expiry: data.expiry,
      },
      summary: {
        subtotal,
        shipping,
        tax,
        total,
      },
    };

    saveOrder(user._id, order);
    setPlacingOrder(false);
    setOrderPlaced(true);
    dispatch(clearCart());
    toast.success("Order placed successfully! \uD83C\uDF89");
  };

  const steps = [
    { id: 1, label: "Shipping", icon: MapPin },
    { id: 2, label: "Payment", icon: CreditCard },
    { id: 3, label: "Review", icon: ClipboardList },
  ];

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12">
            <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Order Placed!
            </h2>
            <p className="text-gray-400 mb-2">
              Thank you,{" "}
              <span className="text-white font-medium">
                {user?.name}
              </span>
              !
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Your order has been confirmed and will be shipped soon.
            </p>
            <div className="bg-purple-900/20 border border-purple-800/30 rounded-xl p-4 mb-8">
              <p className="text-purple-300 text-sm">
                📧 Confirmation sent to{" "}
                <span className="font-medium">{user?.email}</span>
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-semibold transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

      <div className="flex items-center mb-10">
        {steps.map((s, index) => {
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step > s.id
                      ? "bg-green-500 text-white"
                      : step === s.id
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/40"
                        : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {step > s.id ? "✓" : <Icon size={16} />}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    step === s.id ? "text-white" : "text-gray-500"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-px mx-4 transition-all ${
                    step > s.id ? "bg-green-500/40" : "bg-gray-800"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin size={20} className="text-purple-400" />
                <h2 className="text-xl font-bold text-white">
                  Shipping Address
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input
                    {...register("firstName", {
                      required: "First name is required",
                    })}
                    placeholder="Rohan"
                    className={inputClass(errors.firstName)}
                  />
                  <FieldError error={errors.firstName} />
                </div>

                <div>
                  <label className={labelClass}>Last Name</label>
                  <input
                    {...register("lastName", {
                      required: "Last name is required",
                    })}
                    placeholder="Sharma"
                    className={inputClass(errors.lastName)}
                  />
                  <FieldError error={errors.lastName} />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Email Address</label>
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                    })}
                    placeholder="rohan@example.com"
                    className={inputClass(errors.email)}
                  />
                  <FieldError error={errors.email} />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Street Address</label>
                  <input
                    {...register("address", {
                      required: "Street address is required",
                    })}
                    placeholder="221B, MG Road, Andheri West"
                    className={inputClass(errors.address)}
                  />
                  <FieldError error={errors.address} />
                </div>

                <div>
                  <label className={labelClass}>City</label>
                  <input
                    {...register("city", { required: "City is required" })}
                    placeholder="Mumbai"
                    className={inputClass(errors.city)}
                  />
                  <FieldError error={errors.city} />
                </div>

                <div>
                  <label className={labelClass}>State</label>
                  <input
                    {...register("state", { required: "State is required" })}
                    placeholder="Maharashtra"
                    className={inputClass(errors.state)}
                  />
                  <FieldError error={errors.state} />
                </div>

                <div>
                  <label className={labelClass}>PIN Code</label>
                  <input
                    {...register("zip", {
                      required: "PIN code is required",
                      pattern: {
                        value: /^\d{6}$/,
                        message: "Enter a valid 6-digit PIN code",
                      },
                    })}
                    placeholder="400058"
                    className={inputClass(errors.zip)}
                  />
                  <FieldError error={errors.zip} />
                </div>
              </div>

              <button
                type="button"
                onClick={handleContinueToPayment}
                className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-semibold transition-colors"
              >
                Continue to Payment →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard size={20} className="text-purple-400" />
                <h2 className="text-xl font-bold text-white">
                  Payment Details
                </h2>
              </div>

              <div className="bg-linear-to-br from-purple-700 to-purple-900 rounded-2xl p-6 mb-6">
                <p className="text-purple-200 text-xs mb-4">CREDIT CARD</p>
                <p className="text-white text-xl font-mono tracking-widest mb-4">
                  {values?.cardNumber
                    ? values.cardNumber.replace(/(.{4})/g, "$1 ").trim()
                    : "•••• •••• •••• ••••"}
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-purple-300 text-xs">Card Holder</p>
                    <p className="text-white font-medium">
                      {values?.cardName || "YOUR NAME"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-300 text-xs">Expires</p>
                    <p className="text-white font-medium">
                      {values?.expiry || "MM/YY"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Name on Card</label>
                  <input
                    {...register("cardName", {
                      required: "Name on card is required",
                    })}
                    placeholder="Rohan Sharma"
                    className={inputClass(errors.cardName)}
                  />
                  <FieldError error={errors.cardName} />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Card Number</label>
                  <input
                    {...register("cardNumber", {
                      required: "Card number is required",
                      pattern: {
                        value: /^\d{16}$/,
                        message: "Card number must be 16 digits",
                      },
                    })}
                    placeholder="1234567890123456"
                    maxLength={16}
                    className={inputClass(errors.cardNumber)}
                  />
                  <FieldError error={errors.cardNumber} />
                </div>

                <div>
                  <label className={labelClass}>Expiry Date</label>
                  <Controller
                    name="expiry"
                    control={control}
                    rules={{
                      required: "Expiry date is required",
                      pattern: {
                        value: /^\d{2}\/\d{2}$/,
                        message: "Enter expiry as MM/YY",
                      },
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={inputClass(errors.expiry)}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, "");
                          if (v.length > 2) {
                            v = v.slice(0, 2) + "/" + v.slice(2, 4);
                          }
                          field.onChange(v);
                        }}
                      />
                    )}
                  />
                  <FieldError error={errors.expiry} />
                </div>

                <div>
                  <label className={labelClass}>CVV</label>
                  <input
                    {...register("cvv", {
                      required: "CVV is required",
                      pattern: {
                        value: /^\d{3}$/,
                        message: "CVV must be 3 digits",
                      },
                    })}
                    placeholder="123"
                    maxLength={3}
                    className={inputClass(errors.cvv)}
                  />
                  <FieldError error={errors.cvv} />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 py-3.5 rounded-xl font-medium transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleContinueToReview}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-semibold transition-colors"
                >
                  Review Order →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <ClipboardList size={20} className="text-purple-400" />
                <h2 className="text-xl font-bold text-white">
                  Review Your Order
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 p-3 bg-gray-800 rounded-xl"
                  >
                    <div className="bg-white rounded-lg p-2 w-14 h-14 flex items-center justify-center shrink-0">
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
                      <p className="text-gray-400 text-xs mt-0.5">
                        Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-white font-bold text-sm">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-800 rounded-xl p-4 mb-6 text-sm">
                <p className="text-gray-400 mb-1">📦 Shipping to:</p>
                <p className="text-white">
                  {values?.firstName} {values?.lastName},{" "}
                  {values?.address || "N/A"}, {values?.city}, {values?.state}{" "}
                  {values?.zip}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-700 text-gray-400 hover:text-white py-3.5 rounded-xl font-medium transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(onPlaceOrder)}
                  disabled={placingOrder}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  {placingOrder ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-5">Order Summary</h2>

            <div className="space-y-3 mb-5 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-2 text-sm">
                  <div className="bg-white rounded p-1 w-8 h-8 flex items-center justify-center shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-gray-400 flex-1 line-clamp-1 text-xs">
                    {item.title}
                  </span>
                  <span className="text-white text-xs font-medium">
                    ×{item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-800 pt-4 space-y-2">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-400">FREE</span>
                  ) : (
                    `₹${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>GST (18%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between">
                <span className="text-white font-bold">Total</span>
                <span className="text-white font-bold text-xl">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
            <Lock size={16} className="text-green-400 shrink-0" />
            <p className="text-gray-400 text-xs">
              Your payment info is secured with 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
