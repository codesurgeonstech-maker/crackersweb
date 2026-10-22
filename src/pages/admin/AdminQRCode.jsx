import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { getShopById } from '../../services/shopService';
import { QRCodeSVG } from 'qrcode.react';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import {
  Printer,
  Download,
  Copy,
  ExternalLink,
  Flame,
  Check,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export default function AdminQRCode() {
  const { userProfile, shopId } = useAuth();
  const currentShopId = shopId || userProfile?.shopId;

  const [shop, setShop] = useState(null);
  const [copied, setCopied] = useState(false);
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

  const handleDownloadPNG = () => {
    const svg = document.getElementById('poster-qr-code');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 60;
      canvas.height = img.height + 60;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 30, 30);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${shop?.slug || 'shop'}-counter-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      showToast('QR Code image downloaded!', 'success');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
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
              icon={Download}
              onClick={handleDownloadPNG}
            >
              Download PNG
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
            className="bg-white rounded-3xl border-2 border-primary-500/30 p-8 shadow-card flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Festive Top Decorative Banner */}
            <div className="w-full bg-primary-500 text-white py-2 px-4 rounded-2xl mb-6 shadow-xs flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="text-xs font-black tracking-widest uppercase">
                Festive Diwali Crackers Catalogue
              </span>
              <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            </div>

            {/* Shop Brand & Logo */}
            <div className="flex flex-col items-center mb-6">
              {shop?.logoUrl ? (
                <img
                  src={shop.logoUrl}
                  alt={shop.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-primary-100 shadow-md mb-3"
                />
              ) : (
                <img
                  src="/CrackzoLogo.png"
                  alt={shop?.name || "Crackzo"}
                  className="w-20 h-20 rounded-2xl object-contain border-2 border-primary-100 shadow-md mb-3 bg-white"
                />
              )}
              <h2 className="text-2xl font-black text-surface-text tracking-tight">
                {shop?.name || "Crackzo"}
              </h2>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                {shop?.address || "Sivakasi, Tamil Nadu"}
              </p>
            </div>

            {/* High Resolution QR Code */}
            <div className="p-5 bg-white rounded-3xl border-2 border-surface-border shadow-modal mb-6 relative">
              <QRCodeSVG
                id="poster-qr-code"
                value={publicUrl}
                size={qrSize}
                level="H"
                includeMargin={true}
              />
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-primary-600">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Scan with any Camera or UPI App</span>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="w-full bg-surface-secondary/80 rounded-2xl p-4 border border-surface-border mb-6 text-left">
              <h4 className="text-xs font-bold text-surface-text uppercase tracking-wider mb-2.5 text-center">
                3 Simple Steps to Order:
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-white rounded-xl border border-gray-100">
                  <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 font-bold inline-flex items-center justify-center text-[11px] mb-1">
                    1
                  </span>
                  <p className="font-semibold text-gray-700">Scan QR</p>
                  <p className="text-[10px] text-gray-400">Open Catalogue</p>
                </div>
                <div className="p-2 bg-white rounded-xl border border-gray-100">
                  <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 font-bold inline-flex items-center justify-center text-[11px] mb-1">
                    2
                  </span>
                  <p className="font-semibold text-gray-700">Select Items</p>
                  <p className="text-[10px] text-gray-400">Add to cart</p>
                </div>
                <div className="p-2 bg-white rounded-xl border border-gray-100">
                  <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 font-bold inline-flex items-center justify-center text-[11px] mb-1">
                    3
                  </span>
                  <p className="font-semibold text-gray-700">Send WhatsApp</p>
                  <p className="text-[10px] text-gray-400">Quick pickup</p>
                </div>
              </div>
            </div>

            {/* Footer Contact details */}
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-bold text-gray-800">
                WhatsApp Orders: <span className="font-mono text-primary-600">+{shop?.whatsappNumber}</span>
              </p>
              <p className="text-[11px] text-gray-400 font-mono">
                {publicUrl}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
