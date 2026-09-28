import { api } from "../lib/axios";
import type { ApiSuccess, Paginated, Product, ProductPayload } from "../types/api";

const PRODUCT_LIST_LIMIT = 100;

export const getProducts = () =>
  api
    .get<ApiSuccess<Paginated<Product>>>("/api/products", { params: { limit: PRODUCT_LIST_LIMIT } })
    .then((res) => res.data);

export const getProductById = (id: string) =>
  api.get<ApiSuccess<{ product: Product }>>(`/api/products/${id}`).then((res) => res.data);

export const createProduct = (payload: ProductPayload) =>
  api.post<ApiSuccess<{ product: Product }>>("/api/products", payload).then((res) => res.data);

export const updateProduct = (id: string, payload: ProductPayload) =>
  api.put<ApiSuccess<{ product: Product }>>(`/api/products/${id}`, payload).then((res) => res.data);

export const decrementStock = (id: string, quantity: number) =>
  api
    .patch<ApiSuccess<{ product: Product }>>(`/api/products/${id}/stock`, { quantity })
    .then((res) => res.data);

export const deleteProduct = (id: string) =>
  api.delete<ApiSuccess<{ id: string }>>(`/api/products/${id}`).then((res) => res.data);
