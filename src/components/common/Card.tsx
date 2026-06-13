import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  hoverable?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Card({
  title,
  subtitle,
  footer,
  hoverable = false,
  className,
  children,
}: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden',
        hoverable && 'transition-all duration-200 hover:shadow-md hover:-translate-y-1',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-100">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
}
