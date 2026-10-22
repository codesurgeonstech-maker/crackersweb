import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllShops } from '../services/shopService';
import { formatCurrency } from '../utils/formatters';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import {
  Flame,
  Store,
  Sparkles,
  ShieldCheck,
  QrCode,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Search,
  Lock,
  Layers
} from 'lucide-react';

export default function Home() {
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const allShops = await getAllShops();
      setShops(allShops);
      setLoading(false);
    }
    load();
  }, []);

  const filteredShops = shops.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-surface-border sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/CrackzoLogo.png"
              alt="Crackzo"
              className="w-10 h-10 object-contain rounded-xl"
            />
            <div>
              <span className="font-extrabold text-base sm:text-lg text-surface-text tracking-tight block leading-tight">
                Crackzo
              </span>
              <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider">
                Multi-Shop Fireworks Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link to="/admin/login">
              <Button variant="outline" size="sm" className="text-xs px-2.5 sm:px-3">
                <span className="hidden xs:inline sm:inline">Shop </span>Owner
              </Button>
            </Link>
            <Link to="/developer/login">
              <Button size="sm" icon={Lock} className="text-xs px-2.5 sm:px-3">
                <span className="hidden sm:inline">Developer Hub</span>
                <span className="sm:hidden">Dev</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-surface-border py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        {/* Subtle festive background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#D71920_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            <span>Festive Diwali Fireworks & Direct WhatsApp Ordering</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-surface-text tracking-tight leading-tight">
            Celebrate Festive Joy With <span className="text-primary-500">Crackzo</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Browse verified local crackers shops, create your festival box cart, and send your order directly to the shop counter on WhatsApp for instant packing.
          </p>

          {/* Quick Search */}
          <div className="max-w-md mx-auto pt-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search shops by name or town..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-surface-secondary border border-surface-border rounded-2xl text-sm focus:outline-none focus:border-primary-500 focus:bg-white shadow-subtle transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Verified Shops Directory */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-surface-text tracking-tight">
              Verified Crackers Stores
            </h2>
            <p className="text-xs text-gray-500">
              Select a store to open its full public catalogue and order via WhatsApp.
            </p>
          </div>
          <span className="text-xs font-bold text-gray-400">
            {filteredShops.length} active stores
          </span>
        </div>

        {/* Shops Cards Grid */}
        {loading ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            Loading stores...
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="bg-white rounded-3xl border border-surface-border p-10 sm:p-14 text-center max-w-xl mx-auto shadow-subtle">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center mx-auto mb-4 border border-primary-100">
              <Store className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-surface-text mb-2">
              {search ? 'No matching stores found' : 'No Stores Registered Yet'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
              {search
                ? `No stores matching "${search}". Try searching for another name or location.`
                : 'All mock data has been wiped. You can register your first crackers store directly from the Developer Hub.'}
            </p>
            {!search && (
              <Link to="/developer/shops/create">
                <Button icon={ArrowRight}>Register First Store</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <div
                key={shop.id || shop.shopId}
                className="bg-white rounded-3xl border border-surface-border hover:border-primary-300 shadow-subtle hover:shadow-card transition-all duration-200 p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={shop.logoUrl || '/CrackzoLogo.png'}
                        alt={shop.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-xs"
                      />
                      <div>
                        <h3 className="font-extrabold text-base text-surface-text group-hover:text-primary-600 transition-colors">
                          {shop.name}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {shop.address || 'Sivakasi, Tamil Nadu'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={shop.isActive ? 'success' : 'danger'}>
                      {shop.isActive ? 'Open' : 'Closed'}
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed bg-surface-secondary/60 p-3 rounded-xl border border-surface-border">
                    {shop.welcomeMessage || "Explore sparklers, flowerpots, chakras and festival gift boxes."}
                  </p>

                  <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Catalogue Link:</span>
                      <span className="font-mono text-primary-600 font-semibold">/shop/{shop.slug}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">WhatsApp:</span>
                      <span className="font-mono font-medium text-gray-700">+{shop.whatsappNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                  <Link to={`/shop/${shop.slug}`} className="flex-1">
                    <Button className="w-full" size="sm" icon={ArrowRight}>
                      Open Catalogue
                    </Button>
                  </Link>
                  <a
                    href={`https://wa.me/${shop.whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-emerald-200 transition-colors"
                    title="WhatsApp Enquiry"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3 Experience Portals Guide */}
        <div className="mt-14 pt-10 border-t border-surface-border">
          <h3 className="text-center font-extrabold text-lg text-surface-text mb-2">
            Three Experiences — One Multi-Tenant Architecture
          </h3>
          <p className="text-center text-xs text-gray-500 max-w-xl mx-auto mb-8">
            Built strictly on React + Vite, Firebase Auth, Cloud Firestore, and WhatsApp integration with complete shop data isolation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-subtle text-left">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold mb-3">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-surface-text mb-1">Customer Catalogue</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                No sign-in required. Scan shop QR code, browse products, add items to cart, and checkout via WhatsApp click-to-chat.
              </p>
              {shops.length > 0 ? (
                <Link to={`/shop/${shops[0].slug}`} className="text-xs font-bold text-primary-600 hover:underline inline-flex items-center gap-1">
                  Open Store Catalogue →
                </Link>
              ) : (
                <Link to="/developer/shops/create" className="text-xs font-bold text-primary-600 hover:underline inline-flex items-center gap-1">
                  Register First Store →
                </Link>
              )}
            </div>

            <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-subtle text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-surface-text mb-1">Shop Owner Admin</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Each owner manages only their assigned shop, full product CRUD, image uploads, printable QR posters, and order tracking.
              </p>
              <Link to="/admin/login" className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                Owner Portal →
              </Link>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-subtle text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-surface-text mb-1">Developer Admin</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Central developer control over multi-tenant crackers shops, registration, activation/suspension, and aggregate stats.
              </p>
              <Link to="/developer/login" className="text-xs font-bold text-purple-600 hover:underline inline-flex items-center gap-1">
                Developer Hub →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-surface-border py-8 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Crackzo Platform. Festive Fireworks Multi-Shop Network.</p>
      </footer>
    </div>
  );
}
