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
  EyeOff
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
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
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
                Shop Logo
              </label>
              <div className="flex items-center gap-4 p-4 border border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
                <img
                  src={logoPreview || formData.logoUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&auto=format&fit=crop&q=80'}
                  alt="Logo preview"
                  className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
                />
                <div className="space-y-2 flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50">
                    <Upload className="w-4 h-4 text-primary-500" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                  </label>
                  <Input
                    placeholder="or paste logo image URL"
                    value={formData.logoUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, logoUrl: e.target.value });
                      setLogoPreview('');
                    }}
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
