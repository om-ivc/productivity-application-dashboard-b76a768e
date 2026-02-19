'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import AppBar from '@/components/AppBar';
import CategoryGrid from '@/components/categories/CategoryGrid';
import TaskList from '@/components/tasks/TaskList';
import AddCategoryModal from '@/components/categories/AddCategoryModal';
import AddTaskForm from '@/components/tasks/AddTaskForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
      fetchDashboardData(token);
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/login');
    }
  }, [router]);

  const fetchDashboardData = async (token) => {
    try {
      setLoading(true);
      setError(null);

      const [categoriesRes, tasksRes] = await Promise.all([
        fetch('/api/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/tasks', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!categoriesRes.ok || !tasksRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const categoriesData = await categoriesRes.json();
      const tasksData = await tasksRes.json();

      setCategories(categoriesData.data || []);
      setTasks(tasksData.data || []);

      // Calculate stats
      const allTasks = tasksData.data || [];
      const completedTasks = allTasks.filter(t => t.is_completed);
      const highPriorityTasks = allTasks.filter(t => t.priority === 'high' && !t.is_completed);
      const dueSoonTasks = allTasks.filter(t => {
        if (!t.due_date || t.is_completed) return false;
        const dueDate = new Date(t.due_date);
        const today = new Date();
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      });

      setStats({
        total: allTasks.length,
        completed: completedTasks.length,
        highPriority: highPriorityTasks.length,
        dueSoon: dueSoonTasks.length
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryAdded = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchDashboardData(token);
    }
    setShowAddCategory(false);
  };

  const handleTaskAdded = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchDashboardData(token);
    }
    setShowAddTask(false);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
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
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <AppBar user={user} />
        <main className="flex-1 overflow-auto p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Tasks
                </CardTitle>
                <Clock className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
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
                  {stats?.completed || 0}
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
                  {stats?.highPriority || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Due This Week
                </CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats?.dueSoon || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
              <Button onClick={() => setShowAddCategory(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
            <CategoryGrid categories={categories} />
          </div>

          {/* Recent Tasks Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Recent Tasks</h2>
              <Button onClick={() => setShowAddTask(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
            <TaskList 
              tasks={tasks.slice(0, 10)} 
              categories={categories}
              onUpdate={() => {
                const token = localStorage.getItem('token');
                if (token) fetchDashboardData(token);
              }}
            />
          </div>
        </main>
      </div>

      <AddCategoryModal
        open={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onSuccess={handleCategoryAdded}
      />

      <AddTaskForm
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        onSuccess={handleTaskAdded}
        categories={categories}
      />
    </div>
  );
}