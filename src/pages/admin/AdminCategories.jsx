import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import {
  getShopCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from '../../services/categoryService';
import { getShopProducts } from '../../services/productService';
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
  Package
} from 'lucide-react';

export default function AdminCategories() {
  const { userProfile, shopId } = useAuth();
  const currentShopId = shopId || userProfile?.shopId;

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [loading, setLoading] = useState(true);

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-surface-text tracking-tight">
              Catalogue Categories
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Organize your crackers catalogue into clear, easily browsable sections.
            </p>
          </div>

          <Button icon={Plus} size="sm" onClick={handleOpenAdd}>
            Add Category
          </Button>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-3xl border border-surface-border shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-secondary text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Category Name</th>
                  <th className="px-5 py-3">Products Listed</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => {
                  const prodCount = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <tr key={cat.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center">
                          {cat.displayOrder || '•'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-bold text-surface-text">
                        {cat.name}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                          <Package className="w-3.5 h-3.5 text-primary-500" />
                          <span>{prodCount} products</span>
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
          </div>
        </div>

        {/* Category Add/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCategory ? "Edit Category" : "Add New Category"}
        >
          <form onSubmit={handleSaveCategory} className="space-y-4 pt-2">
            <Input
              label="Category Title"
              placeholder="e.g. Peacock Fountains & Aerials"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />

            <Input
              label="Display Order"
              type="number"
              min="1"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              helperText="Determines the order tabs appear in customer catalogue"
            />

            <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" icon={Check}>
                {editingCategory ? "Update Category" : "Add Category"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
