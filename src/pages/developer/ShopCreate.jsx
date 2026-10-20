import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeveloperLayout from '../../components/layout/DeveloperLayout';
import { createShop } from '../../services/shopService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import { Store, Phone, Mail, MapPin, User, Sparkles, Image, Lock } from 'lucide-react';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.whatsappNumber || !formData.ownerEmail) {
      showToast('Please fill in all required shop and owner details.', 'error');
      return;
    }

    setLoading(true);
    try {
      const newShop = await createShop(formData);
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="WhatsApp Order Number (with Country Code)"
                placeholder="e.g. 919876543210"
                icon={Phone}
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                required
                helperText="Orders will be sent to this WhatsApp number."
              />

              <Input
                label="Logo Image URL"
                placeholder="https://..."
                icon={Image}
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              />
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
