import React from 'react';
import { cn } from '../../utils/formatters';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  icon: Icon,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none";

  const variants = {
    primary: "bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:shadow focus:ring-primary-400",
    secondary: "bg-surface-secondary hover:bg-gray-200 text-surface-text border border-surface-border focus:ring-gray-300",
    outline: "border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-300",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-300",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-400",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-400",
    whatsapp: "bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-sm hover:shadow focus:ring-emerald-400"
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-6 py-3.5 gap-2.5 font-semibold",
    icon: "p-2 rounded-lg"
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
