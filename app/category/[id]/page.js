'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import AppBar from '@/components/AppBar';
import TaskList from '@/components/tasks/TaskList';
import AddTaskForm from '@/components/tasks/AddTaskForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Trash2
} from 'lucide-react';
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

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id;

  const [user, setUser] = useState(null);
  const [category, setCategory] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
      fetchCategoryData(token);
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/login');
    }
  }, [router, categoryId]);

  const fetchCategoryData = async (token) => {
    try {
      setLoading(true);
      setError(null);

      const [categoriesRes, tasksRes] = await Promise.all([
        fetch('/api/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/tasks?category_id=${categoryId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!categoriesRes.ok || !tasksRes.ok) {
        throw new Error('Failed to fetch category data');
      }

      const categoriesData = await categoriesRes.json();
      const tasksData = await tasksRes.json();

      const currentCategory = categoriesData.data?.find(c => c.id === categoryId);
      
      if (!currentCategory) {
        throw new Error('Category not found');
      }

      setCategory(currentCategory);
      setTasks(tasksData.data || []);
    } catch (err) {
      console.error('Error fetching category data:', err);
      setError(err.message);
      toast.error('Failed to load category data');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAdded = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCategoryData(token);
    }
    setShowAddTask(false);
  };

  const handleDeleteCategory = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete category');
      }

      toast.success('Category deleted successfully');
      router.push('/');
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar user={user} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col">
          <AppBar user={user} />
          <main className="flex-1 overflow-auto p-8">
            <Skeleton className="h-8 w-64 mb-6" />
            <Skeleton className="h-48 w-full" />
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar user={user} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col">
          <AppBar user={user} />
          <main className="flex-1 overflow-auto p-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </main>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.is_completed).length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && !t.is_completed).length;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <AppBar user={user} />
        <main className="flex-1 overflow-auto p-8">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg"
                  style={{ backgroundColor: category?.color || '#3B82F6' }}
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {category?.name}
                  </h1>
                  <p className="text-gray-500 mt-1">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setShowAddTask(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Category
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Tasks
                </CardTitle>
                <Clock className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasks.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Completed
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {completedTasks}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  High Priority
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {highPriorityTasks}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks */}
          <TaskList 
            tasks={tasks} 
            categories={[category]}
            onUpdate={() => {
              const token = localStorage.getItem('token');
              if (token) fetchCategoryData(token);
            }}
          />
        </main>
      </div>

      <AddTaskForm
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        onSuccess={handleTaskAdded}
        categories={[category]}
        defaultCategoryId={categoryId}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This will also delete all tasks in this category. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}