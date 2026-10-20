import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const lineSubtotal = item.price * item.quantity;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-surface-border last:border-b-0">
      {/* Product Thumbnail */}
      <img
        src={item.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&auto=format&fit=crop&q=80'}
        alt={item.name}
        className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-gray-200 shrink-0"
      />

      {/* Title & Price */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs sm:text-sm font-bold text-surface-text truncate">
          {item.name}
        </h4>
        <p className="text-xs text-primary-600 font-semibold mt-0.5">
          {formatCurrency(item.price)} each
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center border border-surface-border rounded-lg bg-surface-secondary p-0.5">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 text-center text-xs font-bold text-surface-text">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => onRemove(item.id)}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right shrink-0">
        <span className="text-sm font-extrabold text-surface-text block">
          {formatCurrency(lineSubtotal)}
        </span>
      </div>
    </div>
  );
}
