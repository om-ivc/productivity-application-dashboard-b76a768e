import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

/**
 * Create a Supabase admin client with service role key
 * Use this for server-side operations that bypass RLS
 * @returns {Object} Supabase client instance
 */
export function createAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Create a Supabase client with anon key
 * Use this for client-side operations
 * @returns {Object} Supabase client instance
 */
export function createAnonClient() {
  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Execute a database query with error handling
 * @param {Function} queryFn - Async function that executes the query
 * @returns {Promise<Object>} Result object with data or error
 */
export async function executeQuery(queryFn) {
  try {
    const { data, error } = await queryFn();

    if (error) {
      console.error('Database query error:', error);
      return {
        success: false,
        error: error.message || 'Database query failed',
        data: null
      };
    }

    return {
      success: true,
      data,
      error: null
    };
  } catch (error) {
    console.error('Unexpected database error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
      data: null
    };
  }
}

/**
 * Get database statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Statistics object
 */
export async function getUserStats(userId) {
  try {
    const supabase = createAdminClient();

    const [tasksResult, categoriesResult] = await Promise.all([
      supabase
        .from('tasks')
        .select('priority, is_completed')
        .eq('user_id', userId),
      supabase
        .from('categories')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
    ]);

    const tasks = tasksResult.data || [];
    const categoryCount = categoriesResult.count || 0;

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.is_completed).length,
      highPriorityTasks: tasks.filter(t => t.priority === 'high' && !t.is_completed).length,
      mediumPriorityTasks: tasks.filter(t => t.priority === 'medium' && !t.is_completed).length,
      lowPriorityTasks: tasks.filter(t => t.priority === 'low' && !t.is_completed).length,
      totalCategories: categoryCount
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalTasks: 0,
      completedTasks: 0,
      highPriorityTasks: 0,
      mediumPriorityTasks: 0,
      lowPriorityTasks: 0,
      totalCategories: 0
    };
  }
}

/**
 * Check if a user exists
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user exists
 */
export async function userExists(userId) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
}

/**
 * Check if a category belongs to a user
 * @param {string} categoryId - Category ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if category belongs to user
 */
export async function categoryBelongsToUser(categoryId, userId) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .eq('user_id', userId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking category ownership:', error);
    return false;
  }
}