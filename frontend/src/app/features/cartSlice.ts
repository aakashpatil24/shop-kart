import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../types/api";

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  userId: string | null;
}

const loadCart = (userId: string | null): CartItem[] => {
  if (!userId) return [];
  try {
    const cart = localStorage.getItem(`shopcart_cart_${userId}`);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

const saveCart = (userId: string | null, items: CartItem[]): void => {
  if (!userId) return;
  try {
    localStorage.setItem(`shopcart_cart_${userId}`, JSON.stringify(items));
  } catch {
    console.error("Could not save cart to localStorage");
  }
};

// Empty until Navbar dispatches setUser() once AuthContext resolves who's logged in.
const initialState: CartState = {
  items: [],
  userId: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<string | null>) => {
      state.userId = action.payload;
      state.items = loadCart(action.payload);
    },

    // Callers should already guard against exceeding stock (for a toast on the blocked
    // attempt); the clamp here is just a safety net against stale/tampered state.
    addToCart: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find((item) => item._id === action.payload._id);
      if (existingItem) {
        existingItem.quantity = Math.min(existingItem.quantity + 1, existingItem.stock);
      } else {
        state.items.push({ ...action.payload, quantity: Math.min(1, action.payload.stock) });
      }
      saveCart(state.userId, state.items);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      saveCart(state.userId, state.items);
    },

    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item._id !== id);
      } else {
        const item = state.items.find((item) => item._id === id);
        if (item) item.quantity = Math.min(quantity, item.stock);
      }
      saveCart(state.userId, state.items);
    },

    clearCart: (state) => {
      state.items = [];
      saveCart(state.userId, []);
    },

    clearUserState: (state) => {
      state.items = [];
      state.userId = null;
    },
  },
});

export const {
  setUser,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  clearUserState,
} = cartSlice.actions;

export default cartSlice.reducer;

