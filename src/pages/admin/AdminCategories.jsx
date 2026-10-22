import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import {
  getShopCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  bulkImportCategories
} from '../../services/categoryService';
import { getShopProducts } from '../../services/productService';
import { parseCategoriesCSV, getSampleCategoriesCSV } from '../../utils/csvParser';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useToast } from '../../hooks/useToast';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  ArrowUpDown,
  Check,
  Package,
  Upload,
  Download,
  FileSpreadsheet,
  Search,
  X
} from 'lucide-react';

export default function AdminCategories() {
  const { userProfile, shopId } = useAuth();
  const currentShopId = shopId || userProfile?.shopId;

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [loading, setLoading] = useState(true);

  // Bulk CSV Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importMode, setImportMode] = useState('upload'); // 'upload' | 'paste'
  const [parsedPreview, setParsedPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const { showToast } = useToast();

  const loadData = async () => {
    if (!currentShopId) {
      setLoading(false);
      return;
    }
    try {
      const [cats, prods] = await Promise.all([
        getShopCategories(currentShopId),
        getShopProducts(currentShopId)
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch {
      showToast('Error loading categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentShopId]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCategoryName('');
    setDisplayOrder(categories.length + 1);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setDisplayOrder(cat.displayOrder || 1);
    setModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      if (editingCategory) {
        await updateCategory(currentShopId, editingCategory.id, {
          name: categoryName.trim(),
          displayOrder: Number(displayOrder)
        });
        showToast('Category updated successfully!', 'success');
      } else {
        await addCategory(currentShopId, {
          name: categoryName.trim(),
          displayOrder: Number(displayOrder)
        });
        showToast('Category created successfully!', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch {
      showToast('Failed to save category', 'error');
    }
  };

  const handleDelete = async (cat) => {
    const itemCount = products.filter(p => p.categoryId === cat.id).length;
    if (itemCount > 0) {
      if (!window.confirm(`Warning: There are ${itemCount} products listed under "${cat.name}". Are you sure you want to delete this category?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    }

    try {
      await deleteCategory(currentShopId, cat.id);
      showToast('Category deleted successfully', 'success');
      loadData();
    } catch {
      showToast('Failed to delete category', 'error');
    }
  };

  // CSV File Handler
  const handleCSVFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result || '';
      setCsvText(content);
      const parsed = parseCategoriesCSV(content);
      setParsedPreview(parsed);
      if (parsed.length > 0) {
        showToast(`Parsed ${parsed.length} categories from CSV file`, 'success');
      } else {
        showToast('No valid categories found in CSV', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleCsvTextChange = (text) => {
    setCsvText(text);
    const parsed = parseCategoriesCSV(text);
    setParsedPreview(parsed);
  };

  const handleDownloadTemplate = () => {
    const content = getSampleCategoriesCSV();
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crackers_categories_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Category CSV template downloaded', 'success');
  };

  const handleBulkImportCategories = async () => {
    if (parsedPreview.length === 0) {
      showToast('No valid categories to import', 'error');
      return;
    }

    setImporting(true);
    try {
      await bulkImportCategories(currentShopId, parsedPreview);
      showToast(`Successfully imported ${parsedPreview.length} categories!`, 'success');
      setBulkModalOpen(false);
      setCsvText('');
      setParsedPreview([]);
      loadData();
    } catch {
      showToast('Failed to import categories. Please check CSV format.', 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = "Category Name,Display Order\n";
    const rows = categories.map(c => `"${c.name.replace(/"/g, '""')}",${c.displayOrder || 1}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crackers_categories_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Categories exported to CSV', 'success');
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-surface-text tracking-tight">
                Catalogue Categories
              </h1>
              <span className="bg-primary-50 text-primary-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary-200">
                {categories.length} Total
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Organize your crackers catalogue into clear, easily browsable festival sections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={FileSpreadsheet}
              onClick={() => {
                setBulkModalOpen(true);
                setParsedPreview([]);
                setCsvText('');
              }}
              className="text-xs"
            >
              CSV Bulk Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportCSV}
              className="text-xs"
            >
              Export CSV
            </Button>
            <Button icon={Plus} size="sm" onClick={handleOpenAdd} className="text-xs">
              Add Category
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-surface-border shadow-subtle flex items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              icon={Search}
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-primary-600 hover:text-primary-700 font-semibold px-2.5 py-1 bg-primary-50 rounded-lg"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-3xl border border-surface-border shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            {filteredCategories.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-surface-text">No categories found</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  {search ? `No categories match "${search}"` : 'No categories created yet. Click Add Category or CSV Bulk Import.'}
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-sm min-w-[550px]">
                <thead className="bg-surface-secondary text-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Category Name</th>
                    <th className="px-5 py-3">Products Listed</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCategories.map((cat) => {
                    const itemCount = products.filter(p => p.categoryId === cat.id).length;
                    return (
                      <tr key={cat.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-gray-400">
                          #{cat.displayOrder || 1}
                        </td>

                        <td className="px-5 py-3.5 font-bold text-surface-text text-sm">
                          {cat.name}
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            <Package className="w-3 h-3 text-gray-400" />
                            <span>{itemCount} items</span>
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(cat)}
                              className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Edit Category"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add/Edit Category Modal */}
        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editingCategory ? 'Edit Category' : 'Create New Category'}
          >
            <form onSubmit={handleSaveCategory} className="space-y-4 pt-2">
              <Input
                label="Category Name"
                placeholder="e.g. Ground Chakkars, Sparklers, Rockets"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />

              <Input
                label="Display Order (Sort Sequence)"
                type="number"
                min="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                helperText="Lower numbers appear first on the customer catalogue navigation"
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" icon={Check}>
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Bulk Category Import Modal */}
        {bulkModalOpen && (
          <Modal
            isOpen={bulkModalOpen}
            onClose={() => {
              if (!importing) setBulkModalOpen(false);
            }}
            title="Bulk Import Categories via CSV"
            maxWidth="max-w-2xl"
          >
            <div className="space-y-4 pt-2">
              {/* Header Guidance & Template Download */}
              <div className="p-3.5 bg-surface-secondary rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-surface-text flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-primary-500" />
                    <span>Upload CSV or Paste Categories</span>
                  </p>
                  <p className="text-gray-500">
                    Format: <strong>Category Name, Display Order</strong>
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  icon={Download}
                  onClick={handleDownloadTemplate}
                  className="shrink-0 text-xs"
                >
                  Download Sample CSV
                </Button>
              </div>

              {/* Mode switch */}
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <button
                  type="button"
                  onClick={() => setImportMode('upload')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    importMode === 'upload'
                      ? 'bg-primary-500 text-white shadow-xs'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Upload .CSV File
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('paste')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    importMode === 'paste'
                      ? 'bg-primary-500 text-white shadow-xs'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Paste CSV Text
                </button>
              </div>

              {importMode === 'upload' ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-primary-400 bg-gray-50/60 hover:bg-primary-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-gray-200 flex items-center justify-center mx-auto text-primary-500">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-primary-600 hover:underline">
                      Click to choose CSV file
                    </span>
                    <span className="text-xs text-gray-500"> or drag and drop</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Supports .csv files with Category Name & Display Order
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCSVFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Paste CSV Data Lines:
                  </label>
                  <textarea
                    rows={5}
                    value={csvText}
                    onChange={(e) => handleCsvTextChange(e.target.value)}
                    placeholder={`Category Name,Display Order\n"Sparklers",1\n"Flower Pots",2\n"Ground Chakkars",3\n"Garland Crackers",4`}
                    className="w-full p-3 rounded-xl border border-surface-border text-xs font-mono focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white"
                  />
                </div>
              )}

              {/* Live Preview */}
              {parsedPreview.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-surface-text flex items-center gap-1.5">
                      <span>Preview Parsed Categories</span>
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[11px] border border-emerald-200">
                        {parsedPreview.length} Ready to Import
                      </span>
                    </h4>
                  </div>

                  <div className="border border-surface-border rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 text-gray-600 font-semibold sticky top-0">
                        <tr>
                          <th className="px-3.5 py-2">Order</th>
                          <th className="px-3.5 py-2">Category Name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {parsedPreview.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/60">
                            <td className="px-3.5 py-2 font-mono text-gray-500">
                              #{item.displayOrder}
                            </td>
                            <td className="px-3.5 py-2 font-bold text-surface-text">
                              {item.name}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={importing}
                  onClick={() => setBulkModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  icon={Upload}
                  isLoading={importing}
                  disabled={parsedPreview.length === 0}
                  onClick={handleBulkImportCategories}
                >
                  Import {parsedPreview.length > 0 ? `${parsedPreview.length} Categories` : ''}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}
