import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DeveloperLayout from '../../components/layout/DeveloperLayout';
import { getAllShops, toggleShopStatus } from '../../services/shopService';
import { getShopProducts } from '../../services/productService';
import { getShopOrders } from '../../services/orderService';
import { formatDate } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useToast } from '../../hooks/useToast';
import {
  Store,
  PlusCircle,
  Search,
  ExternalLink,
  Power,
  Settings,
  Eye,
  QrCode
} from 'lucide-react';

export default function ShopManagement() {
  const [shops, setShops] = useState([]);
  const [shopStats, setShopStats] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadShops = async () => {
    try {
      const allShops = await getAllShops();
      setShops(allShops);

      const statsMap = {};
      for (const s of allShops) {
        const id = s.id || s.shopId;
        const prods = await getShopProducts(id);
        const ords = await getShopOrders(id);
        statsMap[id] = {
          productsCount: prods.length,
          ordersCount: ords.length
        };
      }
      setShopStats(statsMap);
    } catch (err) {
      showToast('Error loading shops list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  const handleToggleStatus = async (shop) => {
    const newStatus = !shop.isActive;
    try {
      await toggleShopStatus(shop.id || shop.shopId, newStatus);
      showToast(`Shop "${shop.name}" marked as ${newStatus ? 'Active' : 'Suspended'}`, 'success');
      setShops(prev => prev.map(s => {
        if ((s.id || s.shopId) === (shop.id || shop.shopId)) {
          return { ...s, isActive: newStatus };
        }
        return s;
      }));
    } catch {
      showToast('Failed to update shop status', 'error');
    }
  };

  const filteredShops = shops.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.slug.toLowerCase().includes(search.toLowerCase()) ||
                          s.ownerName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : statusFilter === 'active' ? s.isActive : !s.isActive;
    return matchesSearch && matchesStatus;
  });

  return (
    <DeveloperLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-surface-text tracking-tight">
              Shops Directory & Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Manage multi-tenant crackers stores, activate/suspend access, and review store metrics.
            </p>
          </div>
          <Link to="/developer/shops/create">
            <Button icon={PlusCircle}>
              Register New Shop
            </Button>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-surface-border shadow-subtle flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-80">
            <Input
              icon={Search}
              placeholder="Search by shop name, slug, or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                statusFilter === 'all'
                  ? 'bg-primary-50 text-primary-700 border-primary-300'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              All ({shops.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                statusFilter === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Active ({shops.filter(s => s.isActive).length})
            </button>
            <button
              onClick={() => setStatusFilter('suspended')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                statusFilter === 'suspended'
                  ? 'bg-red-50 text-red-700 border-red-300'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Suspended ({shops.filter(s => !s.isActive).length})
            </button>
          </div>
        </div>

        {/* Shops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredShops.map((shop) => {
            const sid = shop.id || shop.shopId;
            const stats = shopStats[sid] || { productsCount: 0, ordersCount: 0 };
            return (
              <div
                key={sid}
                className="bg-white rounded-2xl border border-surface-border shadow-subtle hover:shadow-card transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={shop.logoUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&auto=format&fit=crop&q=80'}
                        alt={shop.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-surface-text truncate">
                          {shop.name}
                        </h3>
                        <p className="text-xs text-primary-600 font-mono">
                          /shop/{shop.slug}
                        </p>
                      </div>
                    </div>
                    <Badge variant={shop.isActive ? 'success' : 'danger'}>
                      {shop.isActive ? 'Active' : 'Suspended'}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-500 my-4 bg-surface-secondary/70 p-3 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Owner:</span>
                      <span className="font-semibold text-gray-700">{shop.ownerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">WhatsApp:</span>
                      <span className="font-mono font-medium text-gray-700">+{shop.whatsappNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Address:</span>
                      <span className="truncate max-w-[170px] text-gray-700">{shop.address || 'Sivakasi'}</span>
                    </div>
                  </div>

                  {/* Product & Order Counts */}
                  <div className="grid grid-cols-2 gap-2 text-center my-3">
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-400">Products</p>
                      <p className="text-lg font-extrabold text-surface-text">{stats.productsCount}</p>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-400">Recorded Orders</p>
                      <p className="text-lg font-extrabold text-surface-text">{stats.ordersCount}</p>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/developer/shops/${sid}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Configure</span>
                    </Link>
                    <a
                      href={`/shop/${shop.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="View Customer Catalogue"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(shop)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      shop.isActive
                        ? 'text-red-600 hover:bg-red-50 border border-red-200'
                        : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{shop.isActive ? 'Suspend' : 'Activate'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DeveloperLayout>
  );
}
