'use client';

import CategoryCard from './CategoryCard';

export default function CategoryGrid({ categories }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No categories yet. Create your first category to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          taskCount={category.task_count || 0}
        />
      ))}
    </div>
  );
}