import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import CategoryNav from '../../components/categories/CategoryNav';
import ProductGrid from '../../components/products/ProductGrid';
import ProductDetailModal from '../../components/products/ProductDetailModal';
import CartDrawer from '../../components/cart/CartDrawer';
import DiwaliHeroBanner from '../../components/common/DiwaliHeroBanner';
import { getShopBySlug } from '../../services/shopService';
import { getShopCategories } from '../../services/categoryService';
import { getShopProducts } from '../../services/productService';
import { useCart } from '../../hooks/useCart';
import { Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

export default function CataloguePage() {
  const { slug } = useParams();
  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { setActiveShopId } = useCart();

  useEffect(() => {
    async function loadShopAndCatalogue() {
      setLoading(true);
      setError(null);
      try {
        const shopData = await getShopBySlug(slug);
        if (!shopData) {
          setError('Shop not found. Please check the catalogue link.');
          setLoading(false);
          return;
        }

        if (!shopData.isActive) {
          setError('This crackers shop is currently inactive or undergoing maintenance.');
          setLoading(false);
          return;
        }

        setShop(shopData);
        setActiveShopId(shopData.id || shopData.shopId);

        const [cats, prods] = await Promise.all([
          getShopCategories(shopData.id || shopData.shopId),
          getShopProducts(shopData.id || shopData.shopId)
        ]);

        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        setError('Failed to load catalogue. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    loadShopAndCatalogue();
  }, [slug, setActiveShopId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center animate-bounce shadow-floating">
            <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300" />
          </div>
          <h2 className="font-bold text-surface-text text-base">Loading festive catalogue...</h2>
          <p className="text-xs text-gray-400">Fetching verified festive fireworks & sparklers</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-surface-border shadow-modal text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-surface-text mb-2">Catalogue Unavailable</h2>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            {error || 'Unable to load store information.'}
          </p>
          <Link to="/">
            <Button size="sm" icon={ArrowLeft} className="w-full">
              Explore Active Shops
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Filter products by selected category and search term
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategoryId === 'all' || !selectedCategoryId
      ? true
      : p.categoryId === selectedCategoryId;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categoryMap = categories.reduce((acc, c) => {
    acc[c.id] = c.name;
    return acc;
  }, {});

  const productCounts = categories.reduce((acc, c) => {
    acc[c.id] = products.filter(p => p.categoryId === c.id).length;
    return acc;
  }, { all: products.length });

  return (
    <CustomerLayout
      shop={shop}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      categories={categories}
      selectedCategoryId={selectedCategoryId}
      onSelectCategory={setSelectedCategoryId}
      totalProductsCount={products.length}
      onOpenCart={() => setIsCartOpen(true)}
    >
      <div className="space-y-4">
        {/* Festive Diwali Showcase Hero Banner */}
        <DiwaliHeroBanner shop={shop} />

        {/* Active Filter Indicator */}
        {(searchTerm || (selectedCategoryId !== 'all' && selectedCategoryId)) && (
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2 text-amber-900 font-semibold truncate">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">
                Showing {filteredProducts.length} items
                {selectedCategoryId && selectedCategoryId !== 'all' && categoryMap[selectedCategoryId]
                  ? ` in "${categoryMap[selectedCategoryId]}"`
                  : ''}
                {searchTerm ? ` matching "${searchTerm}"` : ''}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedCategoryId('all');
                setSearchTerm('');
              }}
              className="px-2.5 py-1 text-xs font-bold text-red-600 hover:text-red-700 bg-white border border-red-200 rounded-lg shrink-0 shadow-xs transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Categories Chip Navigation */}
        <CategoryNav
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          productCounts={productCounts}
        />

        {/* Products Grid */}
        <ProductGrid
          products={filteredProducts}
          categories={categories}
          onOpenDetails={(prod) => setSelectedProduct(prod)}
          shopAcceptsOrders={shop.acceptsOrders !== false}
          onResetFilter={() => {
            setSelectedCategoryId('all');
            setSearchTerm('');
          }}
        />

        {/* Product Details Modal */}
        <ProductDetailModal
          product={selectedProduct}
          categoryName={selectedProduct ? categoryMap[selectedProduct.categoryId] : ''}
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          shopAcceptsOrders={shop.acceptsOrders !== false}
        />

        {/* Cart Drawer Slide-Over */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          shop={shop}
        />
      </div>
    </CustomerLayout>
  );
}
