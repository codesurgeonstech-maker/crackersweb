import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { triggerMiniSparkle } from '../../utils/confetti';
import { Plus, Minus, ShoppingBag, ShieldAlert, Check } from 'lucide-react';

export default function ProductDetailModal({
  product,
  categoryName,
  isOpen,
  onClose,
  shopAcceptsOrders = true
}) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart, cartItems } = useCart();
  const { showToast } = useToast();

  if (!product) return null;

  const existingInCart = cartItems.find(item => item.id === product.id);
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    if (!product.isAvailable || !shopAcceptsOrders) return;
    triggerMiniSparkle(e);
    setIsAdding(true);
    addToCart(product, quantity);
    showToast(`Added ${quantity}x "${product.name}" to cart!`, 'success');
    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 400);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Left: Product Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80'}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80';
            }}
            className="w-full h-full object-cover"
          />
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-primary-500 text-white text-xs font-black px-2 py-0.5 rounded-lg shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Right: Info & Purchase */}
        <div className="flex flex-col justify-between">
          <div>
            {categoryName && (
              <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wider block mb-1">
                {categoryName}
              </span>
            )}
            <h2 className="text-lg font-bold text-surface-text leading-snug mb-2">
              {product.name}
            </h2>

            {/* Price section */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-extrabold text-primary-600">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-400 line-through font-medium">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
              {product.description || "Premium certified festive fireworks with dazzling effects and safe combustion."}
            </p>

            {/* Safety badge */}
            <div className="flex items-center gap-1.5 p-2 bg-amber-50 text-amber-800 rounded-lg text-[11px] border border-amber-200/60 mb-4">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>For outdoor use only. Keep safe distance while lighting.</span>
            </div>
          </div>

          {/* Action bar */}
          <div>
            {product.isAvailable && shopAcceptsOrders ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-600">Quantity:</span>
                  <div className="flex items-center border border-surface-border rounded-xl bg-surface-secondary p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => (q > 1 ? q - 1 : 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-surface-text">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full"
                  size="lg"
                  icon={isAdding ? Check : ShoppingBag}
                >
                  {isAdding ? "Added to Cart!" : `Add to Cart — ${formatCurrency(product.price * quantity)}`}
                </Button>
              </div>
            ) : (
              <Button disabled className="w-full">
                {!shopAcceptsOrders ? "Shop Not Accepting Orders" : "Currently Out of Stock"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
