import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';
import CartItem from './CartItem';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer({
  isOpen,
  onClose,
  shop
}) {
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal, totalItemCount } = useCart();
  const navigate = useNavigate();

  const isBelowMinimum = shop?.minimumOrderValue && subtotal < shop.minimumOrderValue;

  const handleCheckoutClick = () => {
    onClose();
    navigate(`/shop/${shop?.slug}/checkout`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              className="w-screen max-w-md bg-white shadow-modal flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-surface-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-surface-text">
                      Shopping Cart
                    </h3>
                    <p className="text-xs text-gray-500">
                      {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} • {shop?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {cartItems.length > 0 && (
                    <button
                      onClick={() => clearCart()}
                      className="text-xs text-gray-400 hover:text-red-500 font-medium px-2 py-1"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    aria-label="Close cart"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 mb-3">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-surface-text mb-1">Your cart is empty</h4>
                    <p className="text-xs text-gray-500 max-w-xs mb-5">
                      Explore our catalogue of crackers and gift boxes to add items for WhatsApp ordering.
                    </p>
                    <Button onClick={onClose} size="sm" variant="outline">
                      Explore Crackers
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {cartItems.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Checkout Summary Footer */}
              {cartItems.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-surface-border bg-surface-secondary/70 space-y-3">
                  {/* Minimum order check */}
                  {isBelowMinimum && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                      Minimum order value is {formatCurrency(shop.minimumOrderValue)}. Please add {formatCurrency(shop.minimumOrderValue - subtotal)} more to proceed.
                    </div>
                  )}

                  {/* Calculations */}
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Order Subtotal:</span>
                      <span className="font-semibold text-surface-text">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Packing & Taxes:</span>
                      <span className="text-emerald-700 font-semibold">Included</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-surface-text pt-2 border-t border-gray-200">
                      <span>Estimated Total:</span>
                      <span className="text-primary-600">{formatCurrency(subtotal)}</span>
                    </div>
                  </div>

                  {/* WhatsApp checkout call to action */}
                  <Button
                    onClick={handleCheckoutClick}
                    disabled={isBelowMinimum || !shop?.acceptsOrders}
                    className="w-full"
                    size="lg"
                    icon={ArrowRight}
                  >
                    {!shop?.acceptsOrders
                      ? "Orders Temporarily Paused"
                      : isBelowMinimum
                      ? `Minimum ${formatCurrency(shop.minimumOrderValue)} Required`
                      : "Proceed to Order Details"}
                  </Button>

                  <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Review order details before sending to WhatsApp
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
