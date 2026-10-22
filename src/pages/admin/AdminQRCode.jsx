import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { getShopById } from '../../services/shopService';
import { QRCodeSVG } from 'qrcode.react';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import { toPng } from 'html-to-image';
import {
  Printer,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Smartphone
} from 'lucide-react';

export default function AdminQRCode() {
  const { userProfile, shopId } = useAuth();
  const currentShopId = shopId || userProfile?.shopId;

  const [shop, setShop] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [qrSize, setQrSize] = useState(240);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadShop() {
      if (!currentShopId) return;
      const data = await getShopById(currentShopId);
      setShop(data);
    }
    loadShop();
  }, [currentShopId]);

  const publicUrl = shop ? `${window.location.origin}/shop/${shop.slug}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast('Shop catalogue link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = async () => {
    const poster = document.getElementById('qr-poster');
    if (!poster) return;

    setDownloading(true);
    showToast('Generating high-resolution poster image...', 'info');

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }
      // Brief delay to ensure layout & inline SVGs are completely rendered
      await new Promise(resolve => setTimeout(resolve, 150));

      let dataUrl;
      try {
        dataUrl = await toPng(poster, {
          quality: 1,
          pixelRatio: 2,
          backgroundColor: '#FFFFFF',
          cacheBust: true,
        });
      } catch (firstErr) {
        console.warn('Initial toPng failed, retrying with fontEmbedCSS bypassed:', firstErr);
        // Fallback: bypass external font embedding if Google fonts stylesheet throws CORS
        dataUrl = await toPng(poster, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: '#FFFFFF',
          fontEmbedCSS: '',
        });
      }

      const downloadLink = document.createElement('a');
      const safeSlug = (shop?.name || shop?.slug || 'shop')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      downloadLink.download = `${safeSlug}-counter-poster.png`;
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      showToast('Shop poster image downloaded successfully!', 'success');
    } catch (err) {
      console.error('Failed to download poster image:', err);
      showToast('Failed to generate poster image. Please try again or use Print.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-surface-text tracking-tight">
              Counter QR Code & Print Poster
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Generate, download, and print your permanent shop QR code for in-store display and packaging.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={copied ? Check : Copy}
              onClick={handleCopy}
            >
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={downloading ? RefreshCw : Download}
              onClick={handleDownloadPNG}
              disabled={downloading}
              className={downloading ? 'opacity-80 cursor-wait' : ''}
            >
              {downloading ? 'Generating Poster...' : 'Download PNG'}
            </Button>
            <Button
              size="sm"
              icon={Printer}
              onClick={handlePrint}
            >
              Print Shop Poster
            </Button>
          </div>
        </div>

        {/* Printable Counter Poster Card */}
        <div className="max-w-xl mx-auto">
          <div
            id="qr-poster"
            className="bg-white rounded-3xl border-2 border-red-200/80 p-8 shadow-card flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Festive Top Decorative Banner */}
            <div className="w-full bg-[#c81e1e] text-white py-2.5 px-4 rounded-full mb-6 shadow-xs flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="text-xs font-black tracking-widest uppercase">
                Festive Diwali Crackers Catalogue
              </span>
              <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            </div>

            {/* Shop Brand & Logo */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-2xl border border-gray-200 p-2 bg-white shadow-xs mb-3 flex items-center justify-center overflow-hidden">
                <img
                  src={shop?.logoUrl || '/CrackzoLogo.png'}
                  alt={shop?.name || 'Crackzo'}
                  crossOrigin="anonymous"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {shop?.name || "Crackzo"}
              </h2>
              <p className="text-xs text-gray-500 max-w-sm mt-1 font-medium">
                {shop?.address || "Sivakasi, Tamil Nadu"}
              </p>
            </div>

            {/* High Resolution QR Code */}
            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-modal mb-6 relative flex flex-col items-center">
              <QRCodeSVG
                id="poster-qr-code"
                value={publicUrl}
                size={qrSize}
                level="H"
                includeMargin={true}
              />
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-[#c81e1e]">
                <Smartphone className="w-3.5 h-3.5 text-[#c81e1e]" />
                <span>Scan with any Camera or UPI App</span>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="w-full bg-slate-50/80 rounded-2xl p-4 border border-gray-100 mb-6 text-left">
              <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider mb-2.5 text-center">
                3 Simple Steps to Order:
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-xs flex flex-col items-center">
                  <span className="w-5 h-5 rounded-full bg-red-50 text-[#c81e1e] font-bold inline-flex items-center justify-center text-[11px] mb-1">
                    1
                  </span>
                  <p className="font-bold text-gray-700">Scan QR</p>
                  <p className="text-[10px] text-gray-400">Open Catalogue</p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-xs flex flex-col items-center">
                  <span className="w-5 h-5 rounded-full bg-red-50 text-[#c81e1e] font-bold inline-flex items-center justify-center text-[11px] mb-1">
                    2
                  </span>
                  <p className="font-bold text-gray-700">Select Items</p>
                  <p className="text-[10px] text-gray-400">Add to cart</p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-xs flex flex-col items-center">
                  <span className="w-5 h-5 rounded-full bg-red-50 text-[#c81e1e] font-bold inline-flex items-center justify-center text-[11px] mb-1">
                    3
                  </span>
                  <p className="font-bold text-gray-700">Send WhatsApp</p>
                  <p className="text-[10px] text-gray-400">Quick pickup</p>
                </div>
              </div>
            </div>

            {/* Footer Contact details */}
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-bold text-gray-800">
                WhatsApp Orders: <span className="font-mono font-bold text-[#c81e1e]">{String(shop?.whatsappNumber || '').replace(/^\+/, '')}</span>
              </p>
              <p className="text-[11px] text-gray-400 font-mono break-all">
                {publicUrl}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
