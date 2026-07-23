import { type Category, type CategoryId } from '../../stores/categoriesStore';
import { supabase } from '../supabase';
import { categoryFromRow, categoryTypeToRow, goalMsToMinutes } from './mappers';
import { type CategoryRow } from './types';

export async function fetchCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true });
  if (error) throw error;
  return (data as CategoryRow[]).map(categoryFromRow);
}

/** Insert-or-update by id — every write sends the category's full current state. */
export async function upsertCategory(
  userId: string,
  category: Category,
  position: number,
): Promise<void> {
  const { error } = await supabase.from('categories').upsert({
    id: category.id,
    user_id: userId,
    name: category.label,
    icon: category.mascot,
    color: category.color,
    type: categoryTypeToRow(category.type),
    goal_minutes: goalMsToMinutes(category.goalMs),
    position,
    is_hidden: category.hidden,
  });
  if (error) throw error;
}

export async function deleteCategory(id: CategoryId): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function updatePositions(
  pairs: { id: CategoryId; position: number }[],
): Promise<void> {
  await Promise.all(
    pairs.map(async ({ id, position }) => {
      const { error } = await supabase.from('categories').update({ position }).eq('id', id);
      if (error) throw error;
    }),
  );
}

/** Used by "reset to defaults": wipes the user's categories and re-seeds them. */
export async function replaceAllCategories(userId: string, categories: Category[]): Promise<void> {
  const { error: delError } = await supabase.from('categories').delete().eq('user_id', userId);
  if (delError) throw delError;
  const rows = categories.map((c, index) => ({
    id: c.id,
    user_id: userId,
    name: c.label,
    icon: c.mascot,
    color: c.color,
    type: categoryTypeToRow(c.type),
    goal_minutes: goalMsToMinutes(c.goalMs),
    position: index,
    is_hidden: c.hidden,
    is_default: true,
  }));
  const { error } = await supabase.from('categories').insert(rows);
  if (error) throw error;
}
