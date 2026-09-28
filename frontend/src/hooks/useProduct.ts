import { useState, useEffect } from "react";
import { getProductById } from "../services/product.service";
import type { Product } from "../types/api";

const useProduct = (id: string | undefined) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getProductById(id)
      .then((result) => setProduct(result.data.product))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading, error };
};

export default useProduct;

