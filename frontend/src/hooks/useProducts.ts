import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, setCategory, setSearchQuery } from "../app/features/productSlice";
import type { RootState, AppDispatch } from "../app/store";

const useProducts = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, selectedCategory, searchQuery, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // no /categories endpoint on the backend - derive the filter list from results instead
  const categories = useMemo(
    () => [...new Set(items.map((product) => product.category))],
    [items]
  );

  return {
    items,
    categories,
    selectedCategory,
    searchQuery,
    loading,
    error,
    setCategory: (cat: string) => dispatch(setCategory(cat)),
    setSearchQuery: (q: string) => dispatch(setSearchQuery(q)),
  };
};

export default useProducts;

