import React from 'react';
import { Sparkles } from 'lucide-react';

export default function CategoryNav({
  categories = [],
  selectedCategoryId,
  onSelectCategory,
  productCounts = {}
}) {
  const allCount = productCounts['all'];

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1 mb-2">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {/* All Products button */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 border ${
            selectedCategoryId === 'all' || !selectedCategoryId
              ? 'bg-gradient-to-r from-red-600 via-primary-500 to-amber-500 text-white border-transparent shadow-xs'
              : 'bg-white text-gray-700 border-surface-border hover:bg-amber-50/50 hover:border-amber-300 hover:text-amber-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Items</span>
          {allCount !== undefined && (
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                selectedCategoryId === 'all' || !selectedCategoryId
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {allCount}
            </span>
          )}
        </button>

        {/* Category Chips */}
        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          const count = productCounts[category.id];

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 border ${
                isSelected
                  ? 'bg-gradient-to-r from-red-600 via-primary-500 to-amber-500 text-white border-transparent shadow-xs'
                  : 'bg-white text-gray-700 border-surface-border hover:bg-amber-50/50 hover:border-amber-300 hover:text-amber-900'
              }`}
            >
              <span>{category.name}</span>
              {count !== undefined && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
