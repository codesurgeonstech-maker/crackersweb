import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Home / Landing
import Home from '../pages/Home';

// Developer Admin Pages
import DeveloperLogin from '../pages/developer/DeveloperLogin';
import DeveloperDashboard from '../pages/developer/DeveloperDashboard';
import ShopManagement from '../pages/developer/ShopManagement';
import ShopCreate from '../pages/developer/ShopCreate';
import ShopDetail from '../pages/developer/ShopDetail';

// Shop Owner Admin Pages
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import ProductEdit from '../pages/admin/ProductEdit';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminQRCode from '../pages/admin/AdminQRCode';
import AdminSettings from '../pages/admin/AdminSettings';

// Customer Catalogue Pages
import CataloguePage from '../pages/catalogue/CataloguePage';
import ProductDetailPage from '../pages/catalogue/ProductDetailPage';
import CartPage from '../pages/catalogue/CartPage';
import CheckoutPage from '../pages/catalogue/CheckoutPage';
import OrderConfirmationPage from '../pages/catalogue/OrderConfirmationPage';

// Auth Pages
import ForgotPassword from '../pages/auth/ForgotPassword';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Platform Home */}
      <Route path="/" element={<Home />} />

      {/* Developer Admin Routes */}
      <Route path="/developer/login" element={<DeveloperLogin />} />
      <Route
        path="/developer/dashboard"
        element={
          <ProtectedRoute requiredRole="developer">
            <DeveloperDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/developer/shops"
        element={
          <ProtectedRoute requiredRole="developer">
            <ShopManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/developer/shops/create"
        element={
          <ProtectedRoute requiredRole="developer">
            <ShopCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/developer/shops/:shopId"
        element={
          <ProtectedRoute requiredRole="developer">
            <ShopDetail />
          </ProtectedRoute>
        }
      />

      {/* Shop Owner Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="owner">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute requiredRole="owner">
            <AdminProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products/create"
        element={<Navigate to="/admin/products?new=true" replace />}
      />
      <Route
        path="/admin/products/:productId/edit"
        element={
          <ProtectedRoute requiredRole="owner">
            <ProductEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute requiredRole="owner">
            <AdminCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute requiredRole="owner">
            <AdminOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/qr-code"
        element={
          <ProtectedRoute requiredRole="owner">
            <AdminQRCode />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requiredRole="owner">
            <AdminSettings />
          </ProtectedRoute>
        }
      />

      {/* Customer Catalogue Routes */}
      <Route path="/shop/:slug" element={<CataloguePage />} />
      <Route path="/shop/:slug/product/:productId" element={<ProductDetailPage />} />
      <Route path="/shop/:slug/cart" element={<CartPage />} />
      <Route path="/shop/:slug/checkout" element={<CheckoutPage />} />
      <Route path="/shop/:slug/order/:orderId" element={<OrderConfirmationPage />} />

      {/* Auth Utility Routes */}
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
