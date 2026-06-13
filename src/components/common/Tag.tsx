import React from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

interface TagProps {
  label: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  size?: 'sm' | 'md';
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export function Tag({
  label,
  color = 'blue',
  size = 'md',
  removable = false,
  onRemove,
  className,
}: TagProps) {
  const colorStyles = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };
  
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        colorStyles[color],
        sizeStyles[size],
        className
      )}
    >
      {label}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:bg-black/10 rounded-full p-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

interface StatusTagProps {
  status: 'pending' | 'interview' | 'offer' | 'rejected' | 'no-response';
  size?: 'sm' | 'md';
}

const statusLabels: Record<string, string> = {
  pending: '待处理',
  interview: '面试中',
  offer: 'Offer',
  rejected: '已拒绝',
  'no-response': '无反馈',
};

const statusColors: Record<string, 'gray' | 'blue' | 'green' | 'red' | 'yellow'> = {
  pending: 'gray',
  interview: 'blue',
  offer: 'green',
  rejected: 'red',
  'no-response': 'yellow',
};

export function StatusTag({ status, size = 'md' }: StatusTagProps) {
  return (
    <Tag
      label={statusLabels[status]}
      color={statusColors[status]}
      size={size}
    />
  );
}
