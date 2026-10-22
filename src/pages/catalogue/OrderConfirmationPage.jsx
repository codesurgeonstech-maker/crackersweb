import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { getShopBySlug } from '../../services/shopService';
import { getOrderById } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getWhatsAppUrl, buildWhatsAppOrderMessage } from '../../utils/whatsapp';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  MessageCircle,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Store,
  Phone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function OrderConfirmationPage() {
  const { slug, orderId } = useParams();
  const location = useLocation();
  const { showToast } = useToast();

  const [shop, setShop] = useState(location.state?.shop || null);
  const [order, setOrder] = useState(location.state?.order || null);
  const [whatsappUrl, setWhatsappUrl] = useState(location.state?.whatsappUrl || '');
  const [whatsappMessage, setWhatsappMessage] = useState(location.state?.whatsappMessage || '');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    // Fire celebratory confetti on page load
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Confetti fallback
    }

    async function loadData() {
      try {
        const shopData = shop || await getShopBySlug(slug);
        setShop(shopData);

        if (!order) {
          const ord = await getOrderById(shopData?.id || shopData?.shopId, orderId);
          if (ord) {
            setOrder(ord);
            const msg = buildWhatsAppOrderMessage({
              shopName: shopData.name,
              orderReference: ord.orderReference,
              customerName: ord.customerName,
              customerMobile: ord.customerMobile,
              orderType: ord.orderType,
              address: ord.address,
              notes: ord.notes,
              items: ord.items,
              total: ord.total
            });
            setWhatsappMessage(msg);
            setWhatsappUrl(getWhatsAppUrl(shopData.whatsappNumber, msg));
          }
        }
      } catch (err) {
        console.error("Error loading order confirmation", err);
      } finally {
        setLoading(false);
      }
    }

    if (!shop || !order) {
      loadData();
    }
  }, [slug, orderId, shop, order]);

  const handleCopyMessage = () => {
    if (whatsappMessage) {
      navigator.clipboard.writeText(whatsappMessage);
      setCopied(true);
      showToast('Order message copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <CustomerLayout shop={shop}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Main Banner */}
        <div className="bg-white rounded-3xl border border-surface-border shadow-modal p-6 sm:p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-subtle">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
              Order Reference Created
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-surface-text tracking-tight mt-2">
              Continue in WhatsApp to Send Your Order
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
              We generated your order details. To finish, open WhatsApp and press <strong className="text-gray-800">Send</strong> to transmit it to <strong>{shop?.name}</strong>.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
            <Button
              onClick={handleOpenWhatsApp}
              variant="whatsapp"
              size="lg"
              className="w-full text-base font-extrabold shadow-md"
              icon={MessageCircle}
            >
              Open in WhatsApp & Press Send
            </Button>
            <p className="text-[11px] text-emerald-800">
              Shop WhatsApp: <span className="font-mono font-bold">{String(shop?.whatsappNumber || '').replace(/^\+/, '')}</span>
            </p>
          </div>

          {/* Pending Confirmation Warning */}
          <div className="flex items-center justify-center gap-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 text-left">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Note:</strong> Your order remains <strong>Pending Shop Confirmation</strong> until the shop owner confirms availability on WhatsApp.
            </span>
          </div>

          {/* Order Snapshot Card */}
          {order && (
            <div className="text-left bg-surface-secondary/80 rounded-2xl p-5 border border-surface-border space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <span className="text-gray-400 text-xs">Order Reference</span>
                  <p className="font-mono font-extrabold text-base text-surface-text">
                    {order.orderReference}
                  </p>
                </div>
                <Badge variant="warning">
                  Pending Confirmation
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                <div>
                  <span className="text-gray-400 block">Customer:</span>
                  <span className="font-bold text-gray-800">{order.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Mobile:</span>
                  <span className="font-mono font-bold text-gray-800">{String(order.customerMobile || '').replace(/^\+/, '')}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Preference:</span>
                  <span className="font-semibold text-gray-800">{order.orderType || 'Shop Pickup'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Estimated Amount:</span>
                  <span className="font-extrabold text-primary-600 text-sm">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="pt-2 border-t border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Items Snapshot ({order.items?.length || 0})
                </span>
                <div className="space-y-1.5">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-gray-700">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp Text Preview with Copy Option */}
          {whatsappMessage && (
            <div className="text-left pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-500">
                  Prefilled WhatsApp Message Preview
                </span>
                <button
                  onClick={handleCopyMessage}
                  className="text-xs text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
              <pre className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs font-mono text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {whatsappMessage}
              </pre>
            </div>
          )}

          <div className="pt-2">
            <Link to={`/shop/${slug}`}>
              <Button variant="outline" size="sm" className="w-full">
                Return to Shop Catalogue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
