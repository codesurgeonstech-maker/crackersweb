import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DeveloperLayout from '../../components/layout/DeveloperLayout';
import { getAllShops } from '../../services/shopService';
import { getShopProducts } from '../../services/productService';
import { getShopOrders } from '../../services/orderService';
import { formatDate } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  Store,
  CheckCircle,
  AlertOctagon,
  Package,
  ShoppingBag,
  PlusCircle,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

export default function DeveloperDashboard() {
  const [shops, setShops] = useState([]);
  const [stats, setStats] = useState({
    totalShops: 0,
    activeShops: 0,
    suspendedShops: 0,
    totalProducts: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const allShops = await getAllShops();
        setShops(allShops);

        let totalProds = 0;
        let totalOrds = 0;

        for (const shop of allShops) {
          const prods = await getShopProducts(shop.id || shop.shopId);
          const ords = await getShopOrders(shop.id || shop.shopId);
          totalProds += prods.length;
          totalOrds += ords.length;
        }

        const activeCount = allShops.filter(s => s.isActive).length;
        const suspendedCount = allShops.length - activeCount;

        setStats({
          totalShops: allShops.length,
          activeShops: activeCount,
          suspendedShops: suspendedCount,
          totalProducts: totalProds,
          totalOrders: totalOrds
        });
      } catch (err) {
        console.error("Failed to load developer dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const statCards = [
    { title: 'Total Registered Shops', value: stats.totalShops, icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active Shops', value: stats.activeShops, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Suspended Shops', value: stats.suspendedShops, icon: AlertOctagon, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Total Products Listed', value: stats.totalProducts, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Total Recorded Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <DeveloperLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-surface-text tracking-tight">
              Developer Administration Overview
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Multi-shop crackers platform ecosystem metrics and tenant control.
            </p>
          </div>
          <Link to="/developer/shops/create">
            <Button icon={PlusCircle}>
              Register New Shop
            </Button>
          </Link>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white p-4 rounded-2xl border border-surface-border shadow-subtle flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 leading-tight">
                    {card.title}
                  </span>
                  <div className={`w-8 h-8 rounded-xl ${card.bg} ${card.color} flex items-center justify-center shrink-0`}>
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

        {/* Recently Registered Shops Table */}
        <div className="bg-white rounded-2xl border border-surface-border shadow-subtle overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-surface-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-surface-text">
                Registered Shops
              </h2>
              <p className="text-xs text-gray-400">
                Independent crackers store tenants active on the platform.
              </p>
            </div>
            <Link
              to="/developer/shops"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <span>Manage All Shops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-secondary text-gray-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Shop Info</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Owner Contact</th>
                  <th className="px-5 py-3">WhatsApp</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shops.slice(0, 5).map((shop) => (
                  <tr key={shop.id || shop.shopId} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={shop.logoUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&auto=format&fit=crop&q=80'}
                          alt={shop.name}
                          className="w-9 h-9 rounded-xl object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-bold text-surface-text">{shop.name}</p>
                          <p className="text-xs text-gray-400">{shop.address || 'Sivakasi'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-gray-600">
                      /shop/{shop.slug}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-xs text-surface-text">{shop.ownerName}</p>
                      <p className="text-[11px] text-gray-400">{shop.ownerEmail || 'owner@crackers.com'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-gray-600">
                      +{shop.whatsappNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={shop.isActive ? 'success' : 'danger'}>
                        {shop.isActive ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {formatDate(shop.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/developer/shops/${shop.id || shop.shopId}`}
                          className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Manage
                        </Link>
                        <a
                          href={`/shop/${shop.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                          title="Open Customer Catalogue"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DeveloperLayout>
  );
}
