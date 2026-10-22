import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { getShopById } from '../../services/shopService';
import { getShopProducts } from '../../services/productService';
import { getShopOrders } from '../../services/orderService';
import { getShopCategories } from '../../services/categoryService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  Package,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Plus,
  QrCode,
  Settings,
  ArrowRight,
  MessageCircle,
  TrendingUp,
  Layers
} from 'lucide-react';

export default function AdminDashboard() {
  const { userProfile, shopId } = useAuth();
  const currentShopId = shopId || userProfile?.shopId;

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!currentShopId) {
        setLoading(false);
        return;
      }
      try {
        const [shopData, prods, ords, cats] = await Promise.all([
          getShopById(currentShopId),
          getShopProducts(currentShopId),
          getShopOrders(currentShopId),
          getShopCategories(currentShopId)
        ]);
        setShop(shopData);
        setProducts(prods);
        setOrders(ords);
        setCategories(cats);
      } catch (err) {
        console.error("Error loading admin dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentShopId]);

  const availableCount = products.filter(p => p.isAvailable).length;
  const unavailableCount = products.length - availableCount;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Category summary counts
  const categorySummary = categories.map(cat => ({
    name: cat.name,
    count: products.filter(p => p.categoryId === cat.id).length
  }));

  const statCards = [
    { title: 'Total Products', value: products.length, icon: Package, color: 'text-primary-600', bg: 'bg-primary-50' },
    { title: 'In Stock Products', value: availableCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Out of Stock', value: unavailableCount, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Pending Orders', value: pendingOrdersCount, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {shop?.logoUrl ? (
              <img
                src={shop.logoUrl}
                alt={shop.name}
                className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-xs"
              />
            ) : (
              <img
                src="/CrackzoLogo.png"
                alt={shop?.name || "Crackzo"}
                className="w-14 h-14 rounded-2xl object-contain border border-gray-200 shadow-xs bg-white"
              />
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-surface-text tracking-tight">
                {shop?.name || "Shop Owner Dashboard"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {shop?.welcomeMessage || "Manage your festival crackers inventory, orders and counter QR code."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link to="/admin/products?new=true" className="flex-1 sm:flex-none">
              <Button icon={Plus} size="sm" className="w-full">
                Add Product
              </Button>
            </Link>
            <Link to="/admin/qr-code" className="flex-1 sm:flex-none">
              <Button variant="outline" icon={QrCode} size="sm" className="w-full">
                Counter QR
              </Button>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`bg-white p-4 rounded-2xl border border-surface-border shadow-subtle flex flex-col justify-between ${
                  idx === 4 ? 'col-span-2 sm:col-span-1 lg:col-span-1' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500">
                    {card.title}
                  </span>
                  <div className={`w-8 h-8 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-surface-text">
                  {loading ? '...' : card.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* 2-Column: Recent Orders and Category Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-surface-border shadow-subtle overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-surface-border flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-surface-text">
                    Recent WhatsApp Orders
                  </h2>
                  <p className="text-xs text-gray-400">
                    Orders received from customers through the catalogue.
                  </p>
                </div>
                <Link
                  to="/admin/orders"
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <span>View All Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">
                    No orders recorded yet. Share your shop QR code to start receiving orders!
                  </div>
                ) : (
                  <table className="w-full text-left text-sm min-w-[640px]">
                    <thead className="bg-surface-secondary text-gray-500 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-5 py-3">Order Ref</th>
                        <th className="px-5 py-3">Customer</th>
                        <th className="px-5 py-3">Type</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-xs font-bold text-surface-text">
                            {order.orderReference}
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-xs text-surface-text">{order.customerName}</p>
                            <p className="text-[11px] text-gray-400">{String(order.customerMobile || '').replace(/^\+/, '')}</p>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-gray-500">
                            {order.orderType || 'Pickup'}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-xs text-primary-600">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              variant={
                                order.status === 'confirmed' ? 'success' :
                                order.status === 'completed' ? 'info' :
                                order.status === 'cancelled' ? 'danger' : 'warning'
                              }
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <a
                              href={`https://wa.me/${order.customerMobile.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${order.customerName}, regarding your order ${order.orderReference} at ${shop?.name}...`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                              <span>Reply</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Total Volume: <strong className="text-surface-text">{formatCurrency(totalRevenue)}</strong></span>
              <Link to="/admin/orders" className="text-primary-600 font-bold hover:underline">
                Process orders →
              </Link>
            </div>
          </div>

          {/* Product Category Breakdown Card */}
          <div className="bg-white rounded-3xl border border-surface-border shadow-subtle p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary-500" />
                  <h3 className="font-bold text-sm text-surface-text">
                    Category Breakdown
                  </h3>
                </div>
                <Link to="/admin/categories" className="text-xs font-semibold text-primary-600 hover:underline">
                  Manage
                </Link>
              </div>

              {/* Category Items Scroller */}
              <div className="space-y-2 max-h-60 sm:max-h-72 overflow-y-auto pr-1">
                {categorySummary.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No categories recorded yet</p>
                ) : (
                  categorySummary.map((cat, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs py-1.5 px-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-700 truncate pr-2">{cat.name}</span>
                      <span className="font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full shrink-0 text-[11px]">
                        {cat.count} items
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-5 border-t border-gray-100 mt-4 space-y-2">
              <Link to="/admin/products" className="w-full">
                <Button variant="secondary" size="sm" className="w-full">
                  Browse All Products
                </Button>
              </Link>
              <Link to="/admin/settings" className="w-full">
                <Button variant="ghost" size="sm" icon={Settings} className="w-full text-xs text-gray-500">
                  Shop Settings & Terms
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
