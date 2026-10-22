import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import {
  getShopProducts,
  deleteProduct,
  toggleProductAvailability,
  updateProduct,
  bulkImportProducts,
  addProduct
} from '../../services/productService';
import { getShopCategories, addCategory } from '../../services/categoryService';
import { uploadImage } from '../../services/storageService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { parseProductsCSV, getSampleProductsCSV } from '../../utils/csvParser';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
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
  Check,
  FileSpreadsheet,
  Image as ImageIcon,
  AlertCircle,
  X,
  FileText,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function AdminProducts() {
  const { userProfile, shopId } = useAuth();
  const currentShopId = shopId || userProfile?.shopId;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Quick Price Edit Modal
  const [editingPriceProd, setEditingPriceProd] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [newOrigPrice, setNewOrigPrice] = useState('');

  // Add / Edit Product Overlay Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
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
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingProductImg, setUploadingProductImg] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Bulk CSV Upload Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [defaultImageUrl, setDefaultImageUrl] = useState('');
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
      const [prods, cats] = await Promise.all([
        getShopProducts(currentShopId),
        getShopCategories(currentShopId)
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch {
      showToast('Error loading catalogue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentShopId]);

  // Check URL query param for automatic overlay open (e.g. from dashboard or redirect)
  useEffect(() => {
    if (searchParams.get('new') === 'true' || searchParams.get('create') === 'true') {
      handleOpenAddProduct();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, categories]);

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      categoryId: categories[0]?.id || '',
      price: '',
      originalPrice: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80',
      stockQuantity: 100,
      displayOrder: products.length + 1,
      isAvailable: true
    });
    setImageFile(null);
    setImagePreview('');
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name || '',
      categoryId: prod.categoryId || (categories[0]?.id || ''),
      price: prod.price !== undefined ? prod.price : '',
      originalPrice: prod.originalPrice !== undefined && prod.originalPrice !== null ? prod.originalPrice : '',
      description: prod.description || '',
      imageUrl: prod.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80',
      stockQuantity: prod.stockQuantity !== undefined ? prod.stockQuantity : 100,
      displayOrder: prod.displayOrder || 1,
      isAvailable: prod.isAvailable !== false
    });
    setImageFile(null);
    setImagePreview(prod.imageUrl || '');
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price || !productForm.categoryId) {
      showToast('Please fill in product name, price, and category', 'error');
      return;
    }

    setSavingProduct(true);
    try {
      let finalImageUrl = productForm.imageUrl;

      if (imageFile) {
        setUploadingProductImg(true);
        finalImageUrl = await uploadImage(imageFile, currentShopId, 'products', productForm.name);
        setUploadingProductImg(false);
      }

      const payload = {
        name: productForm.name.trim(),
        categoryId: productForm.categoryId,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : null,
        description: productForm.description.trim(),
        imageUrl: finalImageUrl,
        stockQuantity: Number(productForm.stockQuantity) || 100,
        displayOrder: Number(productForm.displayOrder) || 1,
        isAvailable: Boolean(productForm.isAvailable)
      };

      if (editingProduct) {
        await updateProduct(currentShopId, editingProduct.id, payload);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p));
        showToast(`Product "${payload.name}" updated successfully!`, 'success');
      } else {
        const newProd = await addProduct(currentShopId, payload);
        setProducts(prev => [newProd, ...prev]);
        showToast(`Product "${payload.name}" added to catalogue!`, 'success');
      }

      setProductModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSavingProduct(false);
      setUploadingProductImg(false);
    }
  };

  const categoryMap = useMemo(() => {
    return categories.reduce((acc, c) => {
      acc[c.id] = c.name;
      return acc;
    }, {});
  }, [categories]);

  // Toggle In Stock / Sold Out
  const handleToggleAvailability = async (prod) => {
    const updatedStatus = !prod.isAvailable;
    try {
      await toggleProductAvailability(currentShopId, prod.id, updatedStatus);
      setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, isAvailable: updatedStatus } : p));
      showToast(`${prod.name} marked as ${updatedStatus ? 'In Stock' : 'Sold Out'}`, 'success');
    } catch {
      showToast('Failed to update product status', 'error');
    }
  };

  // Delete product
  const handleDelete = async (prod) => {
    if (!window.confirm(`Are you sure you want to delete "${prod.name}" from your catalogue?`)) {
      return;
    }
    try {
      await deleteProduct(currentShopId, prod.id);
      setProducts(prev => prev.filter(p => p.id !== prod.id));
      showToast('Product deleted successfully', 'success');
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  // Quick Price Edit
  const handleOpenPriceModal = (prod) => {
    setEditingPriceProd(prod);
    setNewPrice(prod.price);
    setNewOrigPrice(prod.originalPrice || '');
  };

  const handleSavePrice = async (e) => {
    e.preventDefault();
    if (!newPrice || Number(newPrice) < 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }
    try {
      await updateProduct(currentShopId, editingPriceProd.id, {
        price: Number(newPrice),
        originalPrice: newOrigPrice ? Number(newOrigPrice) : null
      });
      setProducts(prev => prev.map(p => p.id === editingPriceProd.id ? {
        ...p,
        price: Number(newPrice),
        originalPrice: newOrigPrice ? Number(newOrigPrice) : null
      } : p));
      showToast('Price updated successfully', 'success');
      setEditingPriceProd(null);
    } catch {
      showToast('Failed to update price', 'error');
    }
  };

  // Handle CSV file selection
  const handleCSVFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result || '';
      setCsvText(content);
      const parsed = parseProductsCSV(content, defaultImageUrl);
      setParsedPreview(parsed);
      if (parsed.length > 0) {
        showToast(`Parsed ${parsed.length} product rows from file`, 'success');
      } else {
        showToast('No valid product rows found in CSV file', 'error');
      }
    };
    reader.readAsText(file);
  };

  // When CSV text or default image changes, update parsed preview
  const handleCsvTextChange = (text) => {
    setCsvText(text);
    const parsed = parseProductsCSV(text, defaultImageUrl);
    setParsedPreview(parsed);
  };

  const handleDefaultImgChange = (url) => {
    setDefaultImageUrl(url);
    if (csvText.trim()) {
      const parsed = parseProductsCSV(csvText, url);
      setParsedPreview(parsed);
    }
  };

  // Download Sample CSV template
  const handleDownloadTemplate = () => {
    const content = getSampleProductsCSV();
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crackers_products_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Sample CSV template downloaded with Image URL examples', 'success');
  };

  // Execute Bulk CSV import
  const handleBulkImport = async () => {
    if (parsedPreview.length === 0) {
      showToast('No valid product rows to import. Please check your CSV format.', 'error');
      return;
    }

    setImporting(true);
    try {
      // Build category lookup
      let currentCategories = [...categories];
      const categoryMapByName = {};
      const categoryMapById = {};
      currentCategories.forEach(c => {
        categoryMapByName[c.name.trim().toLowerCase()] = c.id;
        categoryMapById[c.id] = c.id;
      });

      const productsToCreate = [];

      for (const item of parsedPreview) {
        let assignedCatId = '';
        const rawCat = (item.categoryRaw || '').trim();

        if (rawCat) {
          if (categoryMapById[rawCat]) {
            assignedCatId = rawCat;
          } else if (categoryMapByName[rawCat.toLowerCase()]) {
            assignedCatId = categoryMapByName[rawCat.toLowerCase()];
          } else {
            // Auto-create category so products are never misfiled
            try {
              const newCategory = await addCategory(currentShopId, {
                name: rawCat,
                displayOrder: currentCategories.length + 1
              });
              assignedCatId = newCategory.id;
              categoryMapByName[rawCat.toLowerCase()] = newCategory.id;
              categoryMapById[newCategory.id] = newCategory.id;
              currentCategories.push(newCategory);
            } catch (catErr) {
              console.warn("Could not auto-create category:", rawCat);
            }
          }
        }

        if (!assignedCatId) {
          assignedCatId = currentCategories[0]?.id || 'general';
        }

        productsToCreate.push({
          name: item.name,
          categoryId: assignedCatId,
          price: Number(item.price) || 0,
          originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
          description: item.description || 'Verified festive crackers item',
          imageUrl: item.imageUrl || defaultImageUrl.trim() || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80',
          stockQuantity: Number(item.stockQuantity) || 100,
          isAvailable: item.isAvailable !== false
        });
      }

      await bulkImportProducts(currentShopId, productsToCreate);
      showToast(`Successfully imported ${productsToCreate.length} products with Image URLs!`, 'success');
      setBulkModalOpen(false);
      setCsvText('');
      setParsedPreview([]);
      setDefaultImageUrl('');
      loadData();
    } catch {
      showToast('CSV import failed. Please check your data format.', 'error');
    } finally {
      setImporting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = "Product Name,Category,Selling Price,MRP / Original Price,Description,Image URL,Stock Quantity,Is Available\n";
    const rows = products.map(p => {
      const name = `"${(p.name || '').replace(/"/g, '""')}"`;
      const cat = `"${(categoryMap[p.categoryId] || 'General').replace(/"/g, '""')}"`;
      const price = p.price || 0;
      const orig = p.originalPrice || '';
      const desc = `"${(p.description || '').replace(/"/g, '""')}"`;
      const img = `"${(p.imageUrl || '').replace(/"/g, '""')}"`;
      const stock = p.stockQuantity || 100;
      const avail = p.isAvailable ? 'Yes' : 'No';
      return `${name},${cat},${price},${orig},${desc},${img},${stock},${avail}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crackers_inventory_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Inventory exported to CSV with Image URLs', 'success');
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
      const matchesCat = selectedCategory === 'all' ? true : p.categoryId === selectedCategory;
      const matchesStock = stockFilter === 'all'
        ? true
        : stockFilter === 'in_stock'
        ? p.isAvailable
        : !p.isAvailable;
      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, search, selectedCategory, stockFilter]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, stockFilter]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-surface-text tracking-tight">
                Products Catalogue
              </h1>
              <span className="bg-primary-50 text-primary-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary-200">
                {products.length} Items
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Manage crackers collection, adjust prices, import via CSV with Image URLs, and toggle stock.
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
            <Button
              icon={Plus}
              size="sm"
              onClick={handleOpenAddProduct}
              className="text-xs"
            >
              Add Product
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-3xl border border-surface-border shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-80">
            <Input
              icon={Search}
              placeholder="Search products by name or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-surface-secondary px-3 py-2 rounded-xl border border-surface-border text-xs flex-1 sm:flex-initial">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-500 font-medium">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-gray-800 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">All Categories ({products.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Status Filter */}
            <div className="flex items-center gap-1.5 bg-surface-secondary px-3 py-2 rounded-xl border border-surface-border text-xs flex-1 sm:flex-initial">
              <span className="text-gray-500 font-medium">Stock:</span>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="bg-transparent text-gray-800 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">All Items</option>
                <option value="in_stock">In Stock ({products.filter(p => p.isAvailable).length})</option>
                <option value="sold_out">Sold Out ({products.filter(p => !p.isAvailable).length})</option>
              </select>
            </div>

            {(search || selectedCategory !== 'all' || stockFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                  setStockFilter('all');
                }}
                className="text-xs text-primary-600 hover:text-primary-700 font-semibold px-2 py-1 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-surface-border shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-surface-text">No products found</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  {search || selectedCategory !== 'all' || stockFilter !== 'all'
                    ? 'No products match your search or filter criteria.'
                    : 'Your catalogue is empty. Click Add Product or CSV Bulk Import to get started.'}
                </p>
              </div>
            ) : (
              <>
                <table className="w-full text-left text-sm min-w-[760px]">
                  <thead className="bg-surface-secondary text-gray-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-center w-16">S.No</th>
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Selling Price</th>
                      <th className="px-5 py-3">Original / MRP</th>
                      <th className="px-5 py-3">Stock Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedProducts.map((prod, idx) => {
                      const sNo = (currentPage - 1) * pageSize + idx + 1;
                      return (
                        <tr key={prod.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-4 py-3.5 text-center font-mono text-xs font-bold text-gray-500">
                            {sNo}
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&auto=format&fit=crop&q=80'}
                                alt={prod.name}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&auto=format&fit=crop&q=80';
                                }}
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
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit Product Details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
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
                  );
                })}
              </tbody>
              </table>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalItems={filteredProducts.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[10, 15, 25, 50, 100]}
                itemLabel="products"
              />
            </>
          )}
        </div>
      </div>

        {/* Add / Edit Product Overlay Popup Modal */}
        {productModalOpen && (
          <Modal
            isOpen={productModalOpen}
            onClose={() => {
              if (!savingProduct && !uploadingProductImg) {
                setProductModalOpen(false);
                setEditingProduct(null);
              }
            }}
            title={editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Cracker Product"}
            maxWidth="max-w-2xl"
          >
            <form onSubmit={handleSaveProduct} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Product Name"
                  placeholder="e.g. 15 cm Deluxe Colour Sparklers"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                    Category <span className="text-primary-500">*</span>
                  </label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-white text-surface-text text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    required
                  >
                    {categories.length === 0 ? (
                      <option value="">General</option>
                    ) : (
                      categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Selling Price (₹)"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 180"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  required
                />

                <Input
                  label="Original MRP / Strike Price (₹) (Optional)"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 350"
                  value={productForm.originalPrice}
                  onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                  helperText={
                    productForm.originalPrice && Number(productForm.originalPrice) > Number(productForm.price || 0)
                      ? `${Math.round(((Number(productForm.originalPrice) - Number(productForm.price)) / Number(productForm.originalPrice)) * 100)}% discount badge will be shown`
                      : 'Shows strike price with discount badge'
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                  Product Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide effect details, pieces per pack, sound/light features..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="block w-full p-3 rounded-xl border border-surface-border bg-white text-surface-text text-xs sm:text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>

              {/* Image Preview & Upload / URL */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                  Product Photo
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3.5 p-3.5 border border-dashed border-gray-300 rounded-2xl bg-gray-50/60">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    <img
                      src={imagePreview || productForm.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&auto=format&fit=crop&q=80'}
                      alt="Product preview"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2 flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-xl shadow-xs transition-colors">
                        <Upload className="w-3.5 h-3.5 text-primary-500" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (!file.type.startsWith('image/')) {
                                showToast('Please select an image file', 'error');
                                return;
                              }
                              setImageFile(file);
                              setImagePreview(URL.createObjectURL(file));
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-gray-400">or enter direct photo URL:</span>
                    </div>

                    <Input
                      placeholder="https://images.unsplash.com/..."
                      value={productForm.imageUrl}
                      onChange={(e) => {
                        setProductForm({ ...productForm, imageUrl: e.target.value });
                        setImagePreview('');
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Stock, Display Order, and Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <Input
                  label="Stock Quantity"
                  type="number"
                  min="0"
                  value={productForm.stockQuantity}
                  onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                />

                <Input
                  label="Display Order"
                  type="number"
                  min="1"
                  value={productForm.displayOrder}
                  onChange={(e) => setProductForm({ ...productForm, displayOrder: e.target.value })}
                />

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                    Availability
                  </label>
                  <button
                    type="button"
                    onClick={() => setProductForm({ ...productForm, isAvailable: !productForm.isAvailable })}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      productForm.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{productForm.isAvailable ? 'In Stock' : 'Sold Out'}</span>
                  </button>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={savingProduct || uploadingProductImg}
                  onClick={() => {
                    setProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={savingProduct || uploadingProductImg}
                  icon={Sparkles}
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Quick Price Edit Modal */}
        {editingPriceProd && (
          <Modal
            isOpen={Boolean(editingPriceProd)}
            onClose={() => setEditingPriceProd(null)}
            title={`Quick Price: ${editingPriceProd.name}`}
          >
            <form onSubmit={handleSavePrice} className="space-y-4 pt-2">
              <Input
                label="Selling Price (₹)"
                type="number"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                required
              />

              <Input
                label="Original MRP / Strike Price (₹) (Optional)"
                type="number"
                min="0"
                value={newOrigPrice}
                onChange={(e) => setNewOrigPrice(e.target.value)}
                helperText="Shows as strikethrough price with discount percentage badge"
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingPriceProd(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" icon={Check}>
                  Update Price
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Bulk CSV Import Modal with Image URL support */}
        {bulkModalOpen && (
          <Modal
            isOpen={bulkModalOpen}
            onClose={() => {
              if (!importing) setBulkModalOpen(false);
            }}
            title="Bulk Import Products via CSV (with Image URLs)"
            maxWidth="max-w-3xl"
          >
            <div className="space-y-4 pt-2">
              {/* Header Guidance & Template Download */}
              <div className="p-3.5 bg-surface-secondary rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-surface-text flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-primary-500" />
                    <span>Upload CSV or Paste Table Data</span>
                  </p>
                  <p className="text-gray-500">
                    Supports <strong>Image URL</strong>, Product Name, Category Name, Price, MRP, and Description.
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

              {/* Mode Switch: File Upload vs Raw Paste */}
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
                /* File Dropzone */
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
                    Supports .csv files exported from Excel, Google Sheets, or our template
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
                /* Text Area */
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Paste CSV Data Lines:
                  </label>
                  <textarea
                    rows={5}
                    value={csvText}
                    onChange={(e) => handleCsvTextChange(e.target.value)}
                    placeholder={`Product Name,Category,Selling Price,MRP,Description,Image URL\n"10 cm Sparklers","Sparklers",65,120,"Golden sparks 10 pcs","https://images.unsplash.com/photo-1514565131-fce0801e5785"\n"Mega 1000 Wala","Garland Crackers",750,1400,"Traditional red ribbon roll","https://images.unsplash.com/photo-1576400883215-7083980b6197"`}
                    className="w-full p-3 rounded-xl border border-surface-border text-xs font-mono focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white"
                  />
                </div>
              )}

              {/* Optional Default Image URL for items without image */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Default Image URL (Optional fallback for rows without image link):
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="url"
                    value={defaultImageUrl}
                    onChange={(e) => handleDefaultImgChange(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-1514565131-fce0801e5785..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Live Preview of parsed rows */}
              {parsedPreview.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-surface-text flex items-center gap-1.5">
                      <span>Preview Parsed Products</span>
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[11px] border border-emerald-200">
                        {parsedPreview.length} Ready to Import
                      </span>
                    </h4>
                    <span className="text-[11px] text-gray-400">Showing first 5 preview items</span>
                  </div>

                  <div className="border border-surface-border rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 text-gray-600 font-semibold sticky top-0">
                        <tr>
                          <th className="px-3 py-2">Image</th>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Category</th>
                          <th className="px-3 py-2">Price</th>
                          <th className="px-3 py-2">MRP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {parsedPreview.slice(0, 5).map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/60">
                            <td className="px-3 py-2">
                              <img
                                src={item.imageUrl || defaultImageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=100&auto=format&fit=crop&q=80'}
                                alt="Thumb"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=100&auto=format&fit=crop&q=80';
                                }}
                                className="w-8 h-8 rounded-lg object-cover bg-gray-100 border border-gray-200"
                              />
                            </td>
                            <td className="px-3 py-2 font-bold text-surface-text truncate max-w-[140px]">
                              {item.name}
                            </td>
                            <td className="px-3 py-2 text-gray-600 truncate max-w-[100px]">
                              {item.categoryRaw || 'General'}
                            </td>
                            <td className="px-3 py-2 font-extrabold text-primary-600">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-3 py-2 text-gray-400">
                              {item.originalPrice ? formatCurrency(item.originalPrice) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  New categories in CSV will be created automatically.
                </span>

                <div className="flex items-center gap-2">
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
                    onClick={handleBulkImport}
                  >
                    Import {parsedPreview.length > 0 ? `${parsedPreview.length} Products` : ''}
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}
