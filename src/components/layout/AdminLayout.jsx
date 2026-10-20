import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  QrCode,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Store,
  Plus
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getShopById } from '../../services/shopService';
import Button from '../common/Button';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shop, setShop] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, shopId, logout } = useAuth();

  useEffect(() => {
    async function loadShop() {
      const targetId = shopId || userProfile?.shopId;
      if (targetId) {
        const shopData = await getShopById(targetId);
        if (shopData) {
          setShop(shopData);
        }
      }
    }
    loadShop();
  }, [shopId, userProfile]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products Catalogue', path: '/admin/products', icon: Package },
    { name: 'Add New Product', path: '/admin/products/create', icon: Plus },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Orders & Enquiries', path: '/admin/orders', icon: ShoppingBag },
    { name: 'QR Code & Posters', path: '/admin/qr-code', icon: QrCode },
    { name: 'Shop Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-surface-border flex flex-col justify-between transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Shop Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-surface-border">
            <div className="flex items-center gap-2.5 min-w-0">
              {shop?.logoUrl ? (
                <img
                  src={shop.logoUrl}
                  alt={shop.name}
                  className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <img
                  src="/CrackzoLogo.png"
                  alt={shop?.name || "Crackzo"}
                  className="w-8 h-8 rounded-lg object-contain border border-gray-200 bg-white"
                />
              )}
              <div className="min-w-0">
                <span className="font-bold text-sm text-surface-text truncate block leading-tight">
                  {shop?.name || "Shop Portal"}
                </span>
                <span className="text-[10px] text-gray-500 block truncate">
                  Owner Dashboard
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-semibold shadow-xs'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* View Public Catalogue + User Logout */}
        <div className="p-3.5 border-t border-surface-border bg-gray-50/50 space-y-2">
          {shop?.slug && (
            <a
              href={`/shop/${shop.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:border-primary-400 hover:text-primary-600 transition-colors shadow-xs"
            >
              <span>View Public Catalogue</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            </a>
          )}

          <div className="pt-2 flex items-center justify-between px-1">
            <div className="truncate text-xs">
              <p className="font-semibold text-surface-text truncate">
                {userProfile?.displayName || shop?.ownerName || 'Shop Owner'}
              </p>
              <p className="text-gray-400 text-[11px] truncate">
                {userProfile?.email || shop?.ownerEmail || 'owner@crackers.com'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Header */}
        <header className="h-16 bg-white border-b border-surface-border flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs text-gray-400 font-medium">Shop Management</span>
              <h2 className="text-sm font-bold text-surface-text">{shop?.name || "My Crackers Shop"}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {shop?.slug && (
              <a
                href={`/shop/${shop.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>Live Store</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
