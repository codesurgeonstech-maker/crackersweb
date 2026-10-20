import React from 'react';
import ProductCard from './ProductCard';
import { ProductSkeleton } from '../common/LoadingSkeleton';
import EmptyState from '../common/EmptyState';
import { Sparkles } from 'lucide-react';

export default function ProductGrid({
  products = [],
  categories = [],
  isLoading = false,
  onOpenDetails,
  shopAcceptsOrders = true,
  onResetFilter
}) {
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No crackers found"
        description="We couldn't find any crackers matching your search or selected category."
        actionText={onResetFilter ? "Show All Items" : undefined}
        onAction={onResetFilter}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={categoryMap[product.categoryId] || ''}
          onOpenDetails={onOpenDetails}
          shopAcceptsOrders={shopAcceptsOrders}
        />
      ))}
    </div>
  );
}
