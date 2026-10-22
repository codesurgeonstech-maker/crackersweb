import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { getShopBySlug } from '../../services/shopService';
import { getProductById } from '../../services/productService';
import { getShopCategories } from '../../services/categoryService';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { triggerMiniSparkle } from '../../utils/confetti';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  ShoppingBag,
  ArrowLeft,
  Plus,
  Minus,
  Check,
  ShieldAlert,
  Share2,
  Sparkles
} from 'lucide-react';

export default function ProductDetailPage() {
  const { slug, productId } = useParams();
  const [shop, setShop] = useState(null);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const { addToCart, setActiveShopId } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const shopData = await getShopBySlug(slug);
        if (!shopData) {
          navigate('/');
          return;
        }
        setShop(shopData);
        setActiveShopId(shopData.id || shopData.shopId);

        const [prod, cats] = await Promise.all([
          getProductById(shopData.id || shopData.shopId, productId),
          getShopCategories(shopData.id || shopData.shopId)
        ]);

        setProduct(prod);
        setCategories(cats);
      } catch (err) {
        console.error("Error loading product detail", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, productId, setActiveShopId, navigate]);

  if (loading || !product || !shop) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-6">
        <div className="animate-pulse space-y-4 max-w-lg w-full">
          <div className="h-64 bg-gray-200 rounded-3xl" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  const categoryName = categories.find(c => c.id === product.categoryId)?.name || 'Crackers';
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    if (!product.isAvailable || shop.acceptsOrders === false) return;
    triggerMiniSparkle(e);
    setIsAdding(true);
    addToCart(product, quantity);
    showToast(`Added ${quantity}x "${product.name}" to cart!`, 'success');
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  return (
    <CustomerLayout shop={shop}>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to={`/shop/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </Link>

        <div className="bg-white rounded-3xl border border-surface-border shadow-modal p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80'}
                alt={product.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80';
                }}
                className="w-full h-full object-cover"
              />
              {discountPercent > 0 && (
                <div className="absolute top-3 left-3 bg-primary-500 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-xs">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Information */}
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-1">
                  {categoryName}
                </span>
                <h1 className="text-2xl font-extrabold text-surface-text leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Verified festive fireworks selection • {shop.name}
                </p>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 p-4 bg-surface-secondary rounded-2xl border border-surface-border">
                <span className="text-3xl font-extrabold text-primary-600">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base text-gray-400 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
                <Badge variant={product.isAvailable ? 'success' : 'danger'} className="ml-auto">
                  {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Description & Effect
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {product.description || "Authentic licensed festive fireworks manufactured under strict safety standards. Produces dazzling visual sparks and vibrant festive colors."}
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl text-xs text-amber-800 border border-amber-200/70">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Keep outdoor safe distance of at least 5 meters when lighting.</span>
              </div>

              {/* Controls */}
              {product.isAvailable && shop.acceptsOrders !== false ? (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-700">Quantity:</span>
                    <div className="flex items-center border border-surface-border rounded-xl bg-surface-secondary p-1">
                      <button
                        type="button"
                        onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-12 text-center text-sm font-bold text-surface-text">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(q => q + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddToCart}
                      className="flex-1"
                      size="lg"
                      icon={isAdding ? Check : ShoppingBag}
                    >
                      {isAdding ? "Added to Cart!" : `Add to Cart — ${formatCurrency(product.price * quantity)}`}
                    </Button>
                    <Link to={`/shop/${slug}/cart`}>
                      <Button variant="outline" size="lg">
                        View Cart
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <Button disabled className="w-full">
                  {shop.acceptsOrders === false ? "Shop Not Accepting Orders" : "Currently Out of Stock"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
