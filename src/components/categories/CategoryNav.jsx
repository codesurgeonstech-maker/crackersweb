import React from 'react';
import { Sparkles } from 'lucide-react';

export default function CategoryNav({
  categories = [],
  selectedCategoryId,
  onSelectCategory
}) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 mb-4">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {/* All Products button */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 border ${
            selectedCategoryId === 'all' || !selectedCategoryId
              ? 'bg-primary-500 text-white border-primary-500 shadow-xs'
              : 'bg-white text-gray-700 border-surface-border hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Items</span>
        </button>

        {/* Category Chips */}
        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 border ${
                isSelected
                  ? 'bg-primary-500 text-white border-primary-500 shadow-xs'
                  : 'bg-white text-gray-700 border-surface-border hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
