import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-surface-border p-3.5 shadow-subtle animate-pulse flex flex-col justify-between">
      <div>
        <div className="w-full aspect-square bg-gray-200 rounded-xl mb-3" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
      </div>
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded w-16" />
        <div className="h-8 bg-gray-200 rounded-lg w-20" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="animate-pulse border-b border-gray-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 bg-gray-200 rounded w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}
