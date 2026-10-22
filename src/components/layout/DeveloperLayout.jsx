
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  PlusCircle,
  LogOut,
  Sparkles,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

export default function DeveloperLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/developer/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/developer/dashboard', icon: LayoutDashboard },
    { name: 'Shops Management', path: '/developer/shops', icon: Store },
    { name: 'Register New Shop', path: '/developer/shops/create', icon: PlusCircle },
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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-surface-border flex flex-col justify-between transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div>
          {/* Logo & Brand */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-surface-border">
            <Link to="/developer/dashboard" className="flex items-center gap-2.5">
              <img
                src="/CrackzoLogo.png"
                alt="Crackzo"
                className="w-8 h-8 object-contain rounded-lg"
              />
              <div>
                <span className="font-bold text-base text-surface-text tracking-tight block leading-tight">
                  Crackzo
                </span>
                <span className="text-[10px] font-semibold text-primary-600 uppercase tracking-wider block">
                  Developer Hub
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
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

        {/* User profile & logout */}
        <div className="p-4 border-t border-surface-border bg-gray-50/50">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
              DEV
            </div>
            <div className="truncate text-xs">
              <p className="font-semibold text-surface-text truncate">
                {userProfile?.displayName || 'Mohan Prakash'}
              </p>
              <p className="text-gray-500 truncate">{userProfile?.email || 'mohanprakash@gmail.com'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            icon={LogOut}
            className="w-full justify-start text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-surface-border flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-gray-400 font-medium">Multi-Tenant Platform</span>
              <h2 className="text-sm font-bold text-surface-text">Developer Administration</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/login"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-primary-600 font-medium"
            >
              Shop Owner Portal <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Content Page */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
