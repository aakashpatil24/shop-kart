import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderHistory from "./pages/OrderHistory";
import MyProducts from "./pages/MyProducts";
import ProductForm from "./pages/ProductForm";
import ProtectedRoute from "./components/ProtectedRoute";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/product/:id" element={<ProductDetail />} />
    <Route
      path="/cart"
      element={
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
      }
    />
    <Route
      path="/checkout"
      element={
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      }
    />
    <Route
      path="/orders"
      element={
        <ProtectedRoute>
          <OrderHistory />
        </ProtectedRoute>
      }
    />
    <Route
      path="/my-products"
      element={
        <ProtectedRoute>
          <MyProducts />
        </ProtectedRoute>
      }
    />
    <Route
      path="/sell"
      element={
        <ProtectedRoute>
          <ProductForm />
        </ProtectedRoute>
      }
    />
    <Route
      path="/products/:id/edit"
      element={
        <ProtectedRoute>
          <ProductForm />
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default AppRoutes;
