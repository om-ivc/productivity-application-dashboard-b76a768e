/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category and all its tasks
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyToken } from '@/lib/jwt';

export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = params;
    const supabase = createAdminClient();

    // Check if category exists and belongs to user
    const { data: category, error: findError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', decoded.id)
      .single();

    if (findError || !category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Delete all tasks in this category first
    const { error: deleteTasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('category_id', id);

    if (deleteTasksError) {
      console.error('Error deleting tasks:', deleteTasksError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete category tasks' },
        { status: 500 }
      );
    }

    // Delete the category
    const { error: deleteCategoryError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (deleteCategoryError) {
      console.error('Error deleting category:', deleteCategoryError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete category' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Category and associated tasks deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}