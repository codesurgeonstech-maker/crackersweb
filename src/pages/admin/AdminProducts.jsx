import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import {
  getShopProducts,
  deleteProduct,
  toggleProductAvailability,
  updateProduct,
  bulkImportProducts
} from '../../services/productService';
import { getShopCategories } from '../../services/categoryService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { useToast } from '../../hooks/useToast';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  Download,
  Filter,
  Package,
  CheckCircle,
  XCircle,
  Eye,
  Check
} from 'lucide-react';

export default function AdminProducts() {
  const { userProfile, shopId } = useAuth();
  const currentShopId = shopId || userProfile?.shopId;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Quick Price Edit Modal
  const [editingPriceProd, setEditingPriceProd] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [newOrigPrice, setNewOrigPrice] = useState('');

  // Bulk CSV Upload Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');

  const { showToast } = useToast();

  const loadData = async () => {
    if (!currentShopId) {
      setLoading(false);
      return;
    }
    try {
      const [prods, cats] = await Promise.all([
        getShopProducts(currentShopId),
        getShopCategories(currentShopId)
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch {
      showToast('Error loading catalogue products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentShopId]);

  const categoryMap = categories.reduce((acc, c) => {
    acc[c.id] = c.name;
    return acc;
  }, {});

  const handleToggleAvailability = async (prod) => {
    const nextStatus = !prod.isAvailable;
    try {
      await toggleProductAvailability(currentShopId, prod.id, nextStatus);
      setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, isAvailable: nextStatus } : p));
      showToast(`"${prod.name}" marked as ${nextStatus ? 'In Stock' : 'Out of Stock'}`, 'success');
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (prod) => {
    if (!window.confirm(`Are you sure you want to delete "${prod.name}"?`)) return;
    try {
      await deleteProduct(currentShopId, prod.id);
      setProducts(prev => prev.filter(p => p.id !== prod.id));
      showToast(`Product deleted successfully`, 'success');
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  const handleOpenPriceModal = (prod) => {
    setEditingPriceProd(prod);
    setNewPrice(prod.price);
    setNewOrigPrice(prod.originalPrice || '');
  };

  const handleSavePrice = async (e) => {
    e.preventDefault();
    if (!editingPriceProd || !newPrice) return;
    try {
      await updateProduct(currentShopId, editingPriceProd.id, {
        price: Number(newPrice),
        originalPrice: newOrigPrice ? Number(newOrigPrice) : null
      });
      setProducts(prev => prev.map(p =>
        p.id === editingPriceProd.id ? { ...p, price: Number(newPrice), originalPrice: newOrigPrice ? Number(newOrigPrice) : null } : p
      ));
      showToast('Price updated successfully!', 'success');
      setEditingPriceProd(null);
    } catch {
      showToast('Failed to update price', 'error');
    }
  };

  // Bulk CSV import
  const handleBulkImport = async () => {
    if (!csvText.trim()) return;
    try {
      const lines = csvText.trim().split('\n');
      const parsedProducts = [];
      // Format: Name, CategoryId, Price, OriginalPrice, Description
      for (const line of lines) {
        const parts = line.split(',').map(s => s.trim());
        if (parts.length >= 3 && parts[0] !== 'Name') {
          parsedProducts.push({
            name: parts[0],
            categoryId: parts[1] || (categories[0]?.id || ''),
            price: Number(parts[2]) || 100,
            originalPrice: parts[3] ? Number(parts[3]) : null,
            description: parts[4] || 'Premium Diwali cracker item',
            isAvailable: true
          });
        }
      }

      if (parsedProducts.length === 0) {
        showToast('No valid product rows found in CSV', 'error');
        return;
      }

      await bulkImportProducts(currentShopId, parsedProducts);
      showToast(`Imported ${parsedProducts.length} products successfully!`, 'success');
      setBulkModalOpen(false);
      setCsvText('');
      loadData();
    } catch {
      showToast('CSV import failed. Please verify the format.', 'error');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = "Name,Category,Price,OriginalPrice,Available,Stock\n";
    const rows = products.map(p =>
      `"${p.name}","${categoryMap[p.categoryId] || 'Uncategorized'}",${p.price},${p.originalPrice || ''},${p.isAvailable ? 'Yes' : 'No'},${p.stockQuantity || 100}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crackers_inventory_${Date.now()}.csv`;
    a.click();
    showToast('Inventory exported to CSV', 'success');
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' ? true : p.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-surface-text tracking-tight">
              Products Catalogue
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Manage your crackers collection, adjust prices, and toggle in-stock availability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Upload}
              onClick={() => setBulkModalOpen(true)}
            >
              CSV Bulk Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Link to="/admin/products/create">
              <Button icon={Plus} size="sm">
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-surface-border shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              icon={Search}
              placeholder="Search products by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-surface-border text-xs sm:text-sm font-medium bg-white text-surface-text focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-surface-border shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-secondary text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Selling Price</th>
                  <th className="px-5 py-3">Original Price</th>
                  <th className="px-5 py-3">Stock Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&auto=format&fit=crop&q=80'}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs sm:text-sm text-surface-text truncate max-w-xs">
                            {prod.name}
                          </p>
                          <p className="text-[11px] text-gray-400 line-clamp-1">
                            {prod.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-xs text-gray-600 font-medium">
                      {categoryMap[prod.categoryId] || 'General'}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-primary-600">
                          {formatCurrency(prod.price)}
                        </span>
                        <button
                          onClick={() => handleOpenPriceModal(prod)}
                          className="text-[10px] text-gray-400 hover:text-primary-600 underline font-medium"
                        >
                          edit
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {prod.originalPrice ? (
                        <span className="line-through">{formatCurrency(prod.originalPrice)}</span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleAvailability(prod)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          prod.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        }`}
                      >
                        {prod.isAvailable ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Sold Out</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/products/${prod.id}/edit`}
                          className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit Full Details"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(prod)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Price Edit Modal */}
        {editingPriceProd && (
          <Modal
            isOpen={Boolean(editingPriceProd)}
            onClose={() => setEditingPriceProd(null)}
            title={`Update Price: ${editingPriceProd.name}`}
          >
            <form onSubmit={handleSavePrice} className="space-y-4 pt-2">
              <Input
                label="Selling Price (₹)"
                type="number"
                min="1"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                required
              />

              <Input
                label="Original MRP Price (₹) (Optional)"
                type="number"
                value={newOrigPrice}
                onChange={(e) => setNewOrigPrice(e.target.value)}
                helperText="If set higher than selling price, a discount badge will be shown."
              />

              <div className="pt-3 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingPriceProd(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" icon={Check}>
                  Save New Price
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Bulk CSV Modal */}
        {bulkModalOpen && (
          <Modal
            isOpen={bulkModalOpen}
            onClose={() => setBulkModalOpen(false)}
            title="Bulk Import Products via CSV"
          >
            <div className="space-y-3 pt-2">
              <p className="text-xs text-gray-500 leading-relaxed">
                Paste CSV lines in the format: <br />
                <code className="text-xs font-mono bg-gray-100 p-1 rounded block mt-1 text-gray-700">
                  Name, CategoryId, SellingPrice, OriginalPrice, Description
                </code>
              </p>

              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Mega 1000 Wala, cat-1, 850, 1500, High decibel traditional garland crackers&#10;Golden Sparklers 30cm, cat-2, 120, 200, Brilliant golden sparks"
                className="w-full p-3 rounded-xl border border-surface-border text-xs font-mono focus:outline-none focus:border-primary-500"
              />

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setBulkModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" icon={Upload} onClick={handleBulkImport}>
                  Import Lines
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}
