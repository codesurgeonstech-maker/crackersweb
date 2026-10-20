import React from 'react';
import { Sparkles } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Sparkles,
  title = "No items found",
  description = "Try adjusting your search or filters to find what you're looking for.",
  actionText,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-dashed border-gray-300 max-w-md mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-surface-text mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
}
