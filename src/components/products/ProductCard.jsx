import React, { useState } from 'react';
import { Plus, Check, ShoppingBag, Eye, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { triggerMiniSparkle } from '../../utils/confetti';
import Badge from '../common/Badge';

export default function ProductCard({
  product,
  categoryName,
  onOpenDetails,
  shopAcceptsOrders = true
}) {
  const { addToCart, cartItems } = useCart();
  const { showToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const existingInCart = cartItems.find(item => item.id === product.id);
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!product.isAvailable || !shopAcceptsOrders) return;

    triggerMiniSparkle(e);
    setIsAdding(true);
    addToCart(product, quantity);
    showToast(`Added ${quantity}x "${product.name}" to cart!`, 'success');

    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => onOpenDetails && onOpenDetails(product)}
      className="group bg-white rounded-2xl border border-surface-border hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Product Image & Badges */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80'}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Festive Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-red-600 via-primary-500 to-amber-500 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-lg shadow-sm border border-amber-300/40">
              {discountPercent}% OFF
            </div>
          )}

          {/* Availability Badge */}
          {!product.isAvailable ? (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
              <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
                Sold Out
              </span>
            </div>
          ) : null}

          {/* Quick Preview Icon on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails && onOpenDetails(product);
            }}
            className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-white/90 text-gray-700 hover:text-primary-600 hover:bg-white shadow-xs backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Content details */}
        <div className="p-3 sm:p-4">
          {categoryName && (
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 truncate">
              {categoryName}
            </p>
          )}

          <h3 className="font-bold text-xs sm:text-sm text-surface-text line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors mb-2 min-h-[2rem]">
            {product.name}
          </h3>

          {/* Pricing */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-extrabold text-primary-600">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action footer: Quantity controls & Add to Cart button */}
      <div className="p-3 sm:p-4 pt-0">
        {product.isAvailable && shopAcceptsOrders ? (
          <div className="space-y-2">
            {/* Small quantity selector */}
            <div className="flex items-center justify-between bg-surface-secondary rounded-xl p-1 border border-surface-border">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-surface-text px-2">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-xs active:scale-[0.98] ${
                isAdding
                  ? 'bg-emerald-600 text-white'
                  : existingInCart
                  ? 'bg-primary-50 text-primary-700 border border-primary-300 hover:bg-primary-100'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
              }`}
            >
              {isAdding ? (
                <>
                  <Check className="w-4 h-4 animate-bounce" />
                  <span>Added!</span>
                </>
              ) : existingInCart ? (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-primary-600" />
                  <span>In Cart ({existingInCart.quantity})</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <button
            disabled
            className="w-full py-2 px-3 rounded-xl text-xs font-medium bg-gray-100 text-gray-400 cursor-not-allowed text-center"
          >
            {!shopAcceptsOrders ? 'Orders Paused' : 'Out of Stock'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
