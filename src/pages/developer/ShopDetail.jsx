import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DeveloperLayout from '../../components/layout/DeveloperLayout';
import { getShopById, updateShop, toggleShopStatus } from '../../services/shopService';
import { uploadImage } from '../../services/storageService';
import { getShopProducts } from '../../services/productService';
import { getShopOrders } from '../../services/orderService';
import { QRCodeSVG } from 'qrcode.react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useToast } from '../../hooks/useToast';
import {
  Store,
  Phone,
  MapPin,
  ExternalLink,
  Power,
  Download,
  Copy,
  Package,
  ShoppingBag,
  ArrowLeft,
  Save,
  Check,
  Upload,
  X
} from 'lucide-react';

export default function ShopDetail() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [shop, setShop] = useState(null);
  const [productsCount, setProductsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    whatsappNumber: '',
    address: '',
    minimumOrderValue: 0,
    welcomeMessage: '',
    safetyTips: '',
    logoUrl: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadShopData() {
      try {
        const data = await getShopById(shopId);
        if (!data) {
          showToast('Shop not found', 'error');
          navigate('/developer/shops');
          return;
        }
        setShop(data);
        setFormData({
          name: data.name || '',
          whatsappNumber: data.whatsappNumber || '',
          address: data.address || '',
          minimumOrderValue: data.minimumOrderValue || 0,
          welcomeMessage: data.welcomeMessage || '',
          safetyTips: data.safetyTips || '',
          logoUrl: data.logoUrl || ''
        });

        const prods = await getShopProducts(shopId);
        const ords = await getShopOrders(shopId);
        setProductsCount(prods.length);
        setOrdersCount(ords.length);
      } catch (err) {
        showToast('Error loading shop details', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadShopData();
  }, [shopId, navigate, showToast]);

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file (PNG, JPG, WEBP, SVG)', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Logo image must be smaller than 5MB', 'error');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleClearLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setFormData(prev => ({ ...prev, logoUrl: '/CrackzoLogo.png' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalLogoUrl = formData.logoUrl;
      if (logoFile) {
        finalLogoUrl = await uploadImage(logoFile, shopId, 'logos', 'logo');
      }

      const updated = await updateShop(shopId, {
        ...formData,
        logoUrl: finalLogoUrl
      });
      setShop(updated);
      setFormData(prev => ({ ...prev, logoUrl: finalLogoUrl }));
      setLogoFile(null);
      setLogoPreview('');
      showToast('Shop details updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update shop details', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    const newStatus = !shop.isActive;
    try {
      await toggleShopStatus(shopId, newStatus);
      setShop(prev => ({ ...prev, isActive: newStatus }));
      showToast(`Shop marked as ${newStatus ? 'Active' : 'Suspended'}`, 'success');
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const publicUrl = shop ? `${window.location.origin}/shop/${shop.slug}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast('Public catalogue URL copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('shop-qr-code');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${shop.slug}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      showToast('QR code downloaded!', 'success');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (loading || !shop) {
    return (
      <DeveloperLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded-3xl" />
        </div>
      </DeveloperLayout>
    );
  }

  return (
    <DeveloperLayout>
      <div className="space-y-6">
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/developer/shops"
              className="p-2 rounded-xl bg-white border border-surface-border text-gray-600 hover:text-gray-900 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-surface-text tracking-tight">
                  {shop.name}
                </h1>
                <Badge variant={shop.isActive ? 'success' : 'danger'}>
                  {shop.isActive ? 'Active' : 'Suspended'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 font-mono">
                Shop ID: {shop.id || shop.shopId} • Slug: /shop/{shop.slug}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/shop/${shop.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-surface-border text-xs font-semibold text-gray-700 hover:text-primary-600 shadow-xs"
            >
              <span>View Catalogue</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Button
              variant={shop.isActive ? 'danger' : 'success'}
              size="sm"
              icon={Power}
              onClick={handleToggle}
            >
              {shop.isActive ? 'Suspend Shop' : 'Activate Shop'}
            </Button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-surface-border shadow-subtle">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400 font-medium">Products</span>
              <Package className="w-4 h-4 text-primary-500" />
            </div>
            <p className="text-2xl font-extrabold text-surface-text">{productsCount}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-surface-border shadow-subtle">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400 font-medium">Recorded Orders</span>
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-surface-text">{ordersCount}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-surface-border shadow-subtle">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400 font-medium">Assigned Owner</span>
              <Store className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-sm font-bold text-surface-text truncate">{shop.ownerName}</p>
            <p className="text-[11px] text-gray-400 truncate">{shop.ownerEmail || 'owner@crackers.com'}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-surface-border shadow-subtle">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400 font-medium">WhatsApp</span>
              <Phone className="w-4 h-4 text-[#25D366]" />
            </div>
            <p className="text-sm font-bold font-mono text-surface-text">{String(shop.whatsappNumber || '').replace(/^\+/, '')}</p>
            <p className="text-[11px] text-emerald-600 font-medium">Active for orders</p>
          </div>
        </div>

        {/* Content: Form + QR Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shop Settings Form */}
          <form onSubmit={handleSave} className="lg:col-span-2 bg-white rounded-3xl border border-surface-border shadow-subtle p-6 space-y-4">
            <h2 className="text-base font-bold text-surface-text pb-2 border-b border-gray-100">
              Configure Shop Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Shop Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="WhatsApp Order Number"
                placeholder="e.g. 919876543210"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value.replace(/^\+/, '') })}
                required
              />
            </div>

            <Input
              label="Physical Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <Input
              label="Minimum Order Amount (₹)"
              type="number"
              value={formData.minimumOrderValue}
              onChange={(e) => setFormData({ ...formData, minimumOrderValue: e.target.value })}
            />

            {/* Shop Logo Upload from Local Device */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                Shop Logo (Upload from Local Device)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-200 shrink-0 p-1 flex items-center justify-center shadow-xs">
                  <img
                    src={logoPreview || formData.logoUrl || '/CrackzoLogo.png'}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-2 flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 transition-colors">
                      <Upload className="w-4 h-4 text-primary-500" />
                      <span>Upload Logo from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        className="hidden"
                      />
                    </label>
                    {(logoFile || logoPreview) && (
                      <button
                        type="button"
                        onClick={handleClearLogo}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remove Selected</span>
                      </button>
                    )}
                    {logoFile && (
                      <span className="text-[11px] text-emerald-600 font-medium truncate max-w-[200px]">
                        ✓ {logoFile.name} (ready to save)
                      </span>
                    )}
                  </div>
                  <Input
                    placeholder="or paste logo image URL"
                    value={formData.logoUrl}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, logoUrl: e.target.value }));
                      if (logoPreview) {
                        setLogoFile(null);
                        setLogoPreview('');
                      }
                    }}
                    helperText="Upload an image from your device (PNG, JPG, WEBP, SVG) or paste a hosted URL."
                  />
                </div>
              </div>
            </div>

            <Input
              label="Welcome Message"
              value={formData.welcomeMessage}
              onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
            />

            <div className="pt-2 flex justify-end">
              <Button type="submit" isLoading={saving} icon={Save}>
                Save Changes
              </Button>
            </div>
          </form>

          {/* QR Code and Quick Share Card */}
          <div className="bg-white rounded-3xl border border-surface-border shadow-subtle p-6 flex flex-col items-center text-center justify-between">
            <div>
              <h3 className="font-bold text-surface-text mb-1">
                Shop Catalogue QR Code
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Counter scanning code for customers
              </p>

              {/* QR Render */}
              <div className="p-4 bg-surface-secondary rounded-2xl border border-surface-border inline-block shadow-subtle mb-4">
                <QRCodeSVG
                  id="shop-qr-code"
                  value={publicUrl}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <p className="text-xs font-mono text-gray-500 break-all px-2 mb-4 bg-gray-50 py-1.5 rounded-lg border border-gray-100">
                {publicUrl}
              </p>
            </div>

            <div className="w-full space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                icon={copied ? Check : Copy}
                onClick={handleCopyLink}
              >
                {copied ? 'Link Copied!' : 'Copy Catalogue Link'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                icon={Download}
                onClick={handleDownloadQR}
              >
                Download PNG QR
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DeveloperLayout>
  );
}
