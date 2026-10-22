import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { getShopById, updateShop } from '../../services/shopService';
import { uploadImage } from '../../services/storageService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import {
  Settings,
  Phone,
  MapPin,
  Image as ImageIcon,
  Upload,
  CheckCircle,
  XCircle,
  Save,
  ShieldCheck,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

export default function AdminSettings() {
  const { userProfile, shopId } = useAuth();
  const currentShopId = shopId || userProfile?.shopId;

  const [shop, setShop] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    whatsappNumber: '',
    address: '',
    logoUrl: '',
    welcomeMessage: '',
    minimumOrderValue: 0,
    acceptsOrders: true,
    safetyTips: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    async function loadData() {
      if (!currentShopId) {
        setLoading(false);
        return;
      }
      try {
        const data = await getShopById(currentShopId);
        if (data) {
          setShop(data);
          setFormData({
            name: data.name || '',
            whatsappNumber: data.whatsappNumber || '',
            address: data.address || '',
            logoUrl: data.logoUrl || '',
            welcomeMessage: data.welcomeMessage || '',
            minimumOrderValue: data.minimumOrderValue || 0,
            acceptsOrders: data.acceptsOrders !== false,
            safetyTips: data.safetyTips || ''
          });
        }
      } catch {
        showToast('Error loading shop settings', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentShopId, showToast]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalLogoUrl = formData.logoUrl;
      if (logoFile) {
        finalLogoUrl = await uploadImage(logoFile, currentShopId, 'logos', 'logo');
      }

      const updated = await updateShop(currentShopId, {
        ...formData,
        logoUrl: finalLogoUrl,
        minimumOrderValue: Number(formData.minimumOrderValue) || 0
      });

      setShop(updated);
      setFormData(prev => ({ ...prev, logoUrl: finalLogoUrl }));
      setLogoFile(null);
      setLogoPreview('');
      showToast('Shop settings saved successfully!', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded-3xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-text tracking-tight">
            Shop Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Configure contact details, WhatsApp ordering rules, catalogue visibility and safety policies.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-surface-border shadow-modal p-6 sm:p-8 space-y-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Settings className="w-5 h-5 text-primary-500" />
              <h2 className="text-base font-bold text-surface-text">Store Identity & Contact</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Shop Display Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="WhatsApp Number (with country code)"
                placeholder="919876543210"
                icon={Phone}
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                required
              />
            </div>

            <Input
              label="Store Address (Counter Pickup Point)"
              placeholder="142 Main Road, Sivakasi"
              icon={MapPin}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            {/* Logo Upload */}
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
          </div>

          {/* Ordering Rules & Policies */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <ShieldCheck className="w-5 h-5 text-primary-500" />
              <h2 className="text-base font-bold text-surface-text">Catalogue & Order Policies</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Minimum Order Value (₹)"
                type="number"
                min="0"
                value={formData.minimumOrderValue}
                onChange={(e) => setFormData({ ...formData, minimumOrderValue: e.target.value })}
                helperText="Orders below this amount cannot checkout"
              />

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                  Order Acceptance Status
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, acceptsOrders: !formData.acceptsOrders })}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                    formData.acceptsOrders
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}
                >
                  {formData.acceptsOrders ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Accepting WhatsApp Orders</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Orders Temporarily Paused</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <Input
              label="Welcome Greeting Message"
              placeholder="e.g. Welcome to our Crackers Store! Authentic Sivakasi fireworks."
              value={formData.welcomeMessage}
              onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                Safety Information & Store Terms
              </label>
              <textarea
                rows={3}
                placeholder="Enter safety instructions or terms displayed at footer..."
                value={formData.safetyTips}
                onChange={(e) => setFormData({ ...formData, safetyTips: e.target.value })}
                className="block w-full p-3 rounded-xl border border-surface-border bg-white text-surface-text text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-gray-100">
            <Button type="submit" isLoading={saving} icon={Save} size="lg">
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
