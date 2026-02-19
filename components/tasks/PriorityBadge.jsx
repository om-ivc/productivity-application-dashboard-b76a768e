'use client';

import { Badge } from '@/components/ui/badge';
import { AlertCircle, Circle, MinusCircle } from 'lucide-react';

export default function PriorityBadge({ priority }) {
  const config = {
    high: {
      label: 'High',
      color: 'bg-red-100 text-red-700 border-red-300',
      icon: AlertCircle
    },
    medium: {
      label: 'Medium',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      icon: MinusCircle
    },
    low: {
      label: 'Low',
      color: 'bg-green-100 text-green-700 border-green-300',
      icon: Circle
    }
  };

  const { label, color, icon: Icon } = config[priority] || config.medium;

  return (
    <Badge variant="outline" className={`${color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}