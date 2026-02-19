'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PriorityBadge from './PriorityBadge';
import EditTaskModal from './EditTaskModal';
import { Pencil, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function TaskItem({ task, categories, onUpdate }) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [updating, setUpdating] = useState(false);

  const category = categories?.find(c => c.id === task.category_id);

  const handleToggleComplete = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          is_completed: !task.is_completed
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task');
      }

      toast.success(task.is_completed ? 'Task marked as incomplete' : 'Task completed!');
      onUpdate();
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete task');
      }

      toast.success('Task deleted successfully');
      onUpdate();
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error(err.message);
    }
  };

  return (
    <>
      <Card className={task.is_completed ? 'opacity-60' : ''}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Checkbox
              checked={task.is_completed}
              onCheckedChange={handleToggleComplete}
              disabled={updating}
              className="mt-1"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className={`font-medium text-gray-900 ${task.is_completed ? 'line-through' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <PriorityBadge priority={task.priority} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEdit(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDelete(true)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3">
                {category && (
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: `${category.color}20`,
                      color: category.color
                    }}
                  >
                    {category.name}
                  </Badge>
                )}

                {task.due_date && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-3 w-3" />
                    {new Date(task.due_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditTaskModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSuccess={() => {
          setShowEdit(false);
          onUpdate();
        }}
        task={task}
        categories={categories}
      />

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}