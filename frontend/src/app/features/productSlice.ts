import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getProducts } from "../../services/product.service";
import type { Product } from "../../types/api";

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Failed to load products";

export const fetchProducts = createAsyncThunk<Product[], void, { rejectValue: string }>(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const result = await getProducts();
      return result.data.items;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

interface ProductState {
  items: Product[];
  selectedCategory: string;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  selectedCategory: "all",
  searchQuery: "",
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load products";
      });
  },
});

export const { setCategory, setSearchQuery } = productSlice.actions;
export default productSlice.reducer;

