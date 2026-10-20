import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { addProduct } from '../../services/productService';
import { getShopCategories } from '../../services/categoryService';
import { uploadImage } from '../../services/storageService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import {
  Package,
  Upload,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export default function ProductCreate() {
  const { userProfile, shopId } = useAuth();
  const currentShopId = shopId || userProfile?.shopId;

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    originalPrice: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80',
    stockQuantity: 100,
    displayOrder: 1,
    isAvailable: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    async function loadCats() {
      if (!currentShopId) return;
      const list = await getShopCategories(currentShopId);
      setCategories(list);
      if (list.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: list[0].id }));
      }
    }
    loadCats();
  }, [currentShopId]);

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
      }
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.categoryId) {
      showToast('Please fill in product name, price, and category', 'error');
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = formData.imageUrl;

      // Upload image to Firebase Storage if a file was selected
      if (imageFile) {
        setUploadingImage(true);
        finalImageUrl = await uploadImage(imageFile, currentShopId, 'products', formData.name);
        setUploadingImage(false);
      }

      await addProduct(currentShopId, {
        ...formData,
        imageUrl: finalImageUrl,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        stockQuantity: Number(formData.stockQuantity) || 100,
        displayOrder: Number(formData.displayOrder) || 1
      });

      showToast(`Product "${formData.name}" added to catalogue!`, 'success');
      navigate('/admin/products');
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl bg-white border border-surface-border text-gray-600 hover:text-gray-900 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-surface-text tracking-tight">
              Add New Cracker Product
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Create an item listing with images, festival pricing and availability.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-surface-border shadow-modal p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Package className="w-5 h-5 text-primary-500" />
              <h2 className="text-base font-bold text-surface-text">Product Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Product Name"
                placeholder="e.g. 15 cm Deluxe Colour Sparklers"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                  Category <span className="text-primary-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="block w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-white text-surface-text text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Selling Price (₹)"
                type="number"
                min="1"
                placeholder="e.g. 180"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />

              <Input
                label="Original MRP (₹) (Optional)"
                type="number"
                placeholder="e.g. 350"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                helperText="Displays a discount badge (e.g. 48% OFF)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                Product Description
              </label>
              <textarea
                rows={3}
                placeholder="Provide effect details, number of pieces in pack, sound/light features..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="block w-full p-3 rounded-xl border border-surface-border bg-white text-surface-text text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>

            {/* Image Upload & Preview */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                Product Image
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                  <img
                    src={imagePreview || formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-xl shadow-xs transition-colors">
                      <Upload className="w-4 h-4 text-primary-500" />
                      <span>Upload Local Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-gray-400">or use Image URL</span>
                  </div>

                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, imageUrl: e.target.value });
                      setImagePreview('');
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Stock, Display Order, and Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <Input
                label="Stock Quantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              />

              <Input
                label="Display Order"
                type="number"
                min="1"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
              />

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                  Availability
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                    formData.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-red-50 text-red-700 border-red-300'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{formData.isAvailable ? 'In Stock (Available)' : 'Out of Stock'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/products')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={saving || uploadingImage}
              icon={Sparkles}
              size="lg"
            >
              Save Product
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
