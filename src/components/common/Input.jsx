import React, { forwardRef } from 'react';
import { cn } from '../../utils/formatters';

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  className,
  type = 'text',
  id,
  required,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-gray-700 tracking-wide">
          {label} {required && <span className="text-primary-500">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-subtle">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={cn(
            "block w-full rounded-xl border border-surface-border bg-white text-surface-text text-sm transition-all duration-150 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-400",
            Icon ? "pl-10 pr-4 py-2.5" : "px-3.5 py-2.5",
            error && "border-red-400 focus:border-red-500 focus:ring-red-100",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
