import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { getShopBySlug } from '../../services/shopService';
import { useCart } from '../../hooks/useCart';
import CartItem from '../../components/cart/CartItem';
import Button from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';
import { ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function CartPage() {
  const { slug } = useParams();
  const [shop, setShop] = useState(null);
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal, totalItemCount, setActiveShopId } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadShop() {
      const data = await getShopBySlug(slug);
      if (data) {
        setShop(data);
        setActiveShopId(data.id || data.shopId);
      }
    }
    loadShop();
  }, [slug, setActiveShopId]);

  const isBelowMinimum = shop?.minimumOrderValue && subtotal < shop.minimumOrderValue;

  return (
    <CustomerLayout shop={shop}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to={`/shop/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>

          {cartItems.length > 0 && (
            <button
              onClick={() => clearCart()}
              className="text-xs text-gray-400 hover:text-red-500 font-medium"
            >
              Clear Cart
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-surface-border shadow-modal p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 border-b border-surface-border mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-surface-text tracking-tight">
                Your Order Cart
              </h1>
              <p className="text-xs text-gray-500">
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} from {shop?.name}
              </p>
            </div>
          </div>

          {cartItems.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-300 flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-surface-text mb-1">Your cart is empty</h3>
              <p className="text-xs text-gray-500 max-w-xs mb-6">
                You haven't added any crackers yet. Browse our festival catalogue to add sparklers and gift boxes.
              </p>
              <Link to={`/shop/${slug}`}>
                <Button size="sm">Explore Crackers</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>

              {/* Order Minimum Check */}
              {isBelowMinimum && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-800 rounded-xl">
                  Notice: Minimum festival order value is {formatCurrency(shop.minimumOrderValue)}. Please add {formatCurrency(shop.minimumOrderValue - subtotal)} more to proceed to checkout.
                </div>
              )}

              {/* Bill Details */}
              <div className="bg-surface-secondary/80 rounded-2xl p-4 space-y-2 text-xs border border-surface-border">
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal:</span>
                  <span className="font-bold text-surface-text">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Festival Packaging & GST:</span>
                  <span className="font-semibold text-emerald-700">Included</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-surface-text pt-2 border-t border-gray-200">
                  <span>Estimated Total:</span>
                  <span className="text-primary-600">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => navigate(`/shop/${slug}/checkout`)}
                  disabled={isBelowMinimum || !shop?.acceptsOrders}
                  className="w-full"
                  size="lg"
                  icon={ArrowRight}
                >
                  Proceed to Checkout & WhatsApp
                </Button>
                <p className="text-[11px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Order is verified with shop pricing before sending
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
