import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, MessageCircle, Search, Flame } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../common/Footer';
import { formatCurrency } from '../../utils/formatters';

export default function CustomerLayout({
  shop,
  searchTerm = '',
  onSearchChange,
  children,
  onOpenCart
}) {
  const { totalItemCount, subtotal } = useCart();
  const navigate = useNavigate();

  const handleWhatsAppContact = () => {
    if (shop?.whatsappNumber) {
      const cleanNumber = shop.whatsappNumber.replace(/\D/g, '');
      const msg = encodeURIComponent(`Hi ${shop.name}, I have an enquiry about your crackers catalogue.`);
      window.open(`https://wa.me/${cleanNumber}?text=${msg}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      {/* Top Notice Banner if shop doesn't accept orders or has minimum order value */}
      {shop?.acceptsOrders === false ? (
        <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-2 text-center shadow-xs">
          ⚠️ Notice: This shop is currently reviewing catalogue and not accepting new orders right now.
        </div>
      ) : shop?.minimumOrderValue > 0 ? (
        <div className="bg-primary-50 text-primary-700 border-b border-primary-100 text-xs font-medium px-4 py-1.5 text-center">
          🎆 Minimum order for festival packing: <span className="font-bold">{formatCurrency(shop.minimumOrderValue)}</span>
        </div>
      ) : null}

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Shop Brand & Logo */}
            <Link to={`/shop/${shop?.slug || ''}`} className="flex items-center gap-3 min-w-0">
              {shop?.logoUrl ? (
                <img
                  src={shop.logoUrl}
                  alt={shop.name}
                  className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                />
              ) : (
                <img
                  src="/CrackzoLogo.png"
                  alt={shop?.name || "Crackzo"}
                  className="w-10 h-10 rounded-xl object-contain border border-gray-200 shrink-0 bg-white"
                />
              )}
              <div className="min-w-0">
                <h1 className="font-extrabold text-base sm:text-lg text-surface-text tracking-tight truncate leading-tight">
                  {shop?.name || "Crackers Shop"}
                </h1>
                <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Verified Sivakasi Fireworks
                </p>
              </div>
            </Link>

            {/* Live Search bar for desktop */}
            {onSearchChange && (
              <div className="hidden md:flex flex-1 max-w-md mx-4">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search sparklers, flowerpots, gift boxes..."
                    className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-surface-border rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all placeholder:text-gray-400"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => onSearchChange('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Actions: WhatsApp Chat & Cart */}
            <div className="flex items-center gap-2.5">
              {shop?.whatsappNumber && (
                <button
                  onClick={handleWhatsAppContact}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
                  title="Contact shop on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                  <span>Enquiry</span>
                </button>
              )}

              {/* Cart Button with animated badge */}
              <button
                onClick={onOpenCart || (() => navigate(`/shop/${shop?.slug}/cart`))}
                className="relative flex items-center gap-2 p-2.5 sm:px-3.5 sm:py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl border border-primary-200 transition-all active:scale-95"
                aria-label="View shopping cart"
              >
                <ShoppingCart className="w-5 h-5 text-primary-600" />
                <span className="hidden sm:inline text-xs font-bold">Cart</span>
                <AnimatePresence>
                  {totalItemCount > 0 && (
                    <motion.span
                      key={totalItemCount}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="bg-primary-600 text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-xs"
                    >
                      {totalItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* Search bar row on mobile */}
          {onSearchChange && (
            <div className="md:hidden pb-3 pt-1">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search sparklers, flowerpots..."
                  className="w-full pl-9 pr-8 py-2 bg-surface-secondary border border-surface-border rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Catalogue Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {children}
      </main>

      {/* Floating Bottom Cart Bar for Mobile when cart has items */}
      <AnimatePresence>
        {totalItemCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-3 left-4 right-4 z-40 sm:hidden"
          >
            <div
              onClick={onOpenCart || (() => navigate(`/shop/${shop?.slug}/cart`))}
              className="bg-primary-600 hover:bg-primary-700 text-white p-3.5 rounded-2xl shadow-floating flex items-center justify-between cursor-pointer border border-primary-500 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
                  {totalItemCount}
                </div>
                <div>
                  <p className="text-xs text-white/80 font-medium">Your Cart ({totalItemCount} items)</p>
                  <p className="text-base font-extrabold">{formatCurrency(subtotal)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold bg-white text-primary-600 px-3.5 py-2 rounded-xl shadow-xs">
                <span>View Cart</span>
                <ShoppingCart className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer shopName={shop?.name} whatsappNumber={shop?.whatsappNumber} />
    </div>
  );
}
