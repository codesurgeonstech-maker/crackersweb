import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { getShopBySlug } from '../../services/shopService';
import { createOrder } from '../../services/orderService';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/formatters';
import { buildWhatsAppOrderMessage, getWhatsAppUrl } from '../../utils/whatsapp';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import {
  ShoppingBag,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  FileText,
  MessageCircle,
  Truck,
  Store,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function CheckoutPage() {
  const { slug } = useParams();
  const [shop, setShop] = useState(null);
  const { cartItems, subtotal, clearCart, setActiveShopId } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    customerMobile: '',
    orderType: 'Shop Pickup',
    address: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Always start at top of checkout page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

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

  // If cart is empty, redirect back to catalogue
  useEffect(() => {
    if (cartItems.length === 0 && shop) {
      navigate(`/shop/${slug}`);
    }
  }, [cartItems, shop, slug, navigate]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    // Prevent duplicate checkout clicks
    if (submitting) return;

    if (!formData.customerName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }
    if (!formData.customerMobile.trim() || formData.customerMobile.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    if (formData.orderType === 'Delivery' && !formData.address.trim()) {
      showToast('Please enter your delivery address', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const targetShopId = shop.id || shop.shopId;

      // 1. Create order in Firestore / database (performs server/trusted price validation)
      const orderResult = await createOrder({
        shopId: targetShopId,
        customerName: formData.customerName.trim(),
        customerMobile: formData.customerMobile.trim(),
        orderType: formData.orderType,
        address: formData.address.trim(),
        notes: formData.notes.trim(),
        items: cartItems
      });

      // 2. Build human-readable WhatsApp prefilled message
      const whatsappMessage = buildWhatsAppOrderMessage({
        shopName: shop.name,
        orderReference: orderResult.orderReference,
        customerName: formData.customerName.trim(),
        customerMobile: formData.customerMobile.trim(),
        orderType: formData.orderType,
        address: formData.address.trim(),
        notes: formData.notes.trim(),
        items: orderResult.items || cartItems,
        total: orderResult.total || subtotal
      });

      // 3. Open WhatsApp Click-to-Chat in a new tab
      const whatsappUrl = getWhatsAppUrl(shop.whatsappNumber, whatsappMessage);
      window.open(whatsappUrl, '_blank');

      // 4. Clear current shop cart
      clearCart(targetShopId);

      // 5. Navigate to Order Confirmation / WhatsApp instruction screen
      showToast('Order generated! Opening WhatsApp...', 'success');
      navigate(`/shop/${slug}/order/${orderResult.id || orderResult.orderReference}`, {
        state: {
          order: orderResult,
          shop: shop,
          whatsappUrl: whatsappUrl,
          whatsappMessage: whatsappMessage
        }
      });
    } catch (err) {
      showToast(err.message || 'Failed to place order. Please check item availability.', 'error');
      setSubmitting(false);
    }
  };

  return (
    <CustomerLayout shop={shop}>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to={`/shop/${slug}/cart`}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Customer Details Form */}
          <form onSubmit={handleSubmitOrder} className="lg:col-span-7 bg-white rounded-3xl border border-surface-border shadow-modal p-6 sm:p-8 space-y-5">
            <div>
              <h1 className="text-xl font-extrabold text-surface-text tracking-tight">
                Customer & Order Information
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                No sign up required. Enter your details to send your order on WhatsApp.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Your Full Name"
                placeholder="e.g. Kumar"
                icon={User}
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />

              <Input
                label="WhatsApp Mobile Number"
                type="tel"
                placeholder="10-digit mobile (e.g. 9876543210)"
                icon={Phone}
                value={formData.customerMobile}
                onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                required
                helperText="Used for order confirmation and status updates"
              />

              {/* Order Preference: Pickup or Delivery */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                  Order Preference
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, orderType: 'Shop Pickup' })}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      formData.orderType === 'Shop Pickup'
                        ? 'bg-primary-50 text-primary-700 border-primary-500 shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>Counter Pickup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, orderType: 'Delivery' })}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      formData.orderType === 'Delivery'
                        ? 'bg-primary-50 text-primary-700 border-primary-500 shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Home Delivery</span>
                  </button>
                </div>
              </div>

              {formData.orderType === 'Delivery' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                    Delivery Address <span className="text-primary-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="House/Door No, Street Name, Area, City, Pincode"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    className="block w-full p-3 rounded-xl border border-surface-border text-xs focus:border-primary-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                  Special Notes or Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please pack separately for gifting, prefer morning pickup..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="block w-full p-3 rounded-xl border border-surface-border text-xs focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="whatsapp"
                size="lg"
                className="w-full text-base font-bold"
                isLoading={submitting}
                icon={MessageCircle}
              >
                Place Order on WhatsApp
              </Button>
              <p className="text-[11px] text-gray-400 text-center mt-2">
                Clicking will open WhatsApp with your prefilled order message.
              </p>
            </div>
          </form>

          {/* Final Order Review Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-surface-border shadow-subtle p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <h3 className="font-bold text-sm text-surface-text">
                  Order Review
                </h3>
                <span className="text-xs text-primary-600 font-semibold">
                  {cartItems.reduce((acc, it) => acc + it.quantity, 0)} Items
                </span>
              </div>

              {/* Items scroll */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-gray-100 text-gray-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {item.quantity}x
                      </span>
                      <span className="font-medium text-surface-text truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-gray-800 shrink-0 ml-2">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price summary */}
              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Packaging Charges</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-surface-text pt-2 border-t border-gray-200">
                  <span>Estimated Total</span>
                  <span className="text-primary-600">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              {/* Security info */}
              <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100 flex items-start gap-2 text-[11px] text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Safe & Direct:</strong> You pay directly to the verified shop owner at counter pickup or delivery.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
