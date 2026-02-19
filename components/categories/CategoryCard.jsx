'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderKanban } from 'lucide-react';
import Link from 'next/link';

export default function CategoryCard({ category, taskCount = 0 }) {
  return (
    <Link href={`/category/${category.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: category.color || '#3B82F6' }}
            >
              <FolderKanban className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold">
              {category.name}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
            </span>
            <Badge variant="secondary">
              {new Date(category.created_at).toLocaleDateString()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}