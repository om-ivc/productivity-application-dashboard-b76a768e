'use client';

import TaskItem from './TaskItem';

export default function TaskList({ tasks, categories, onUpdate }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No tasks yet. Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          categories={categories}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}