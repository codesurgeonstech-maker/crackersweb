import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeveloperLayout from '../../components/layout/DeveloperLayout';
import { createShop } from '../../services/shopService';
import { uploadImage } from '../../services/storageService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import { Store, Phone, Mail, MapPin, User, Sparkles, Image, Lock, Upload, X } from 'lucide-react';

export default function ShopCreate() {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    whatsappNumber: '',
    logoUrl: '/CrackzoLogo.png',
    address: '',
    minimumOrderValue: 500,
    welcomeMessage: '',
    safetyTips: 'Always maintain safe distance. Keep a bucket of water and sand ready. Light under adult supervision.'
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleNameChange = (e) => {
    const val = e.target.value;
    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: prev.slug === '' || prev.slug === autoSlug.slice(0, -1) ? autoSlug : prev.slug
    }));
  };

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
    if (!formData.name || !formData.whatsappNumber || !formData.ownerEmail) {
      showToast('Please fill in all required shop and owner details.', 'error');
      return;
    }

    setLoading(true);
    try {
      let finalLogoUrl = formData.logoUrl;
      if (logoFile) {
        const uploadFolder = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `shop_${Date.now()}`;
        finalLogoUrl = await uploadImage(logoFile, uploadFolder, 'logos', 'logo');
      }

      const newShop = await createShop({
        ...formData,
        logoUrl: finalLogoUrl
      });
      showToast(`Shop "${newShop.name}" registered successfully!`, 'success');
      navigate('/developer/shops');
    } catch (err) {
      showToast(err.message || 'Failed to register shop', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeveloperLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-text tracking-tight">
            Register New Crackers Shop
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Provision a new shop tenant, create its unique catalogue URL, and assign owner credentials.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-surface-border shadow-modal p-6 sm:p-8 space-y-6">
          {/* Shop Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Store className="w-5 h-5 text-primary-500" />
              <h2 className="text-base font-bold text-surface-text">Shop Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Shop Name"
                placeholder="e.g. Sivakasi Star Fireworks"
                value={formData.name}
                onChange={handleNameChange}
                required
              />

              <div>
                <Input
                  label="Unique Slug (Catalogue URL)"
                  placeholder="e.g. sivakasi-star-fireworks"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Public URL: <span className="font-mono text-primary-600">/shop/{formData.slug || 'slug'}</span>
                </p>
              </div>
            </div>

            <Input
              label="WhatsApp Order Number (with Country Code)"
              placeholder="e.g. 919876543210"
              icon={Phone}
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              required
              helperText="Orders will be sent to this WhatsApp number."
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
                        ✓ {logoFile.name} (ready to upload)
                      </span>
                    )}
                  </div>
                  <Input
                    placeholder="or paste custom logo image URL"
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
              label="Shop Physical Address"
              placeholder="e.g. 88 By-Pass Road, Sivakasi, Tamil Nadu"
              icon={MapPin}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Minimum Order Value (₹)"
                type="number"
                min="0"
                value={formData.minimumOrderValue}
                onChange={(e) => setFormData({ ...formData, minimumOrderValue: e.target.value })}
                helperText="Set 0 for no minimum order restriction"
              />

              <Input
                label="Welcome Greeting Message"
                placeholder="e.g. Welcome to our festive store!"
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
              />
            </div>
          </div>

          {/* Shop Owner Credentials Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <User className="w-5 h-5 text-primary-500" />
              <h2 className="text-base font-bold text-surface-text">Shop Owner Account</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Owner Full Name"
                placeholder="e.g. Rajesh Kannan"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                required
              />

              <Input
                label="Owner Login Email"
                type="email"
                icon={Mail}
                placeholder="owner@example.com"
                value={formData.ownerEmail}
                onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                required
              />
            </div>

            <Input
              label="Initial Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={formData.ownerPassword}
              onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
              helperText="The shop owner will use this password to log in at /admin/login"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/developer/shops')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              icon={Sparkles}
              size="lg"
            >
              Provision & Register Shop
            </Button>
          </div>
        </form>
      </div>
    </DeveloperLayout>
  );
}
