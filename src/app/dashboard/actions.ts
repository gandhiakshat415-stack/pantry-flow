'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { getUserProfile } from '@/utils/supabase/server'

export async function addInventoryItem(formData: FormData) {
  const supabase = await createClient()
  const { profile } = await getUserProfile()

  if (!profile?.household_id) {
    return { error: 'No household found' }
  }

  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const quantity = parseFloat(formData.get('quantity') as string) || 0
  const unit = formData.get('unit') as string
  const status = formData.get('status') as string || 'full'

  if (!name) {
    return { error: 'Name is required' }
  }

  const { error } = await supabase
    .from('inventory')
    .insert({
      household_id: profile.household_id,
      name,
      category,
      quantity,
      unit,
      status
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateItemStatus(item_id: string, new_status: 'full' | 'low' | 'empty'): Promise<void> {
  const supabase = await createClient()
  const { profile } = await getUserProfile()

  if (!profile?.household_id) {
    console.error('No household found')
    return;
  }

  let itemName = '';
  if (new_status === 'low') {
    const { data: itemData } = await supabase.from('inventory').select('name').eq('id', item_id).single();
    if (itemData) itemName = itemData.name;
  }

  const { error } = await supabase
    .from('inventory')
    .update({ status: new_status })
    .eq('id', item_id)
    .eq('household_id', profile.household_id)

  if (error) {
    console.error(error.message)
    return;
  }

  if (new_status === 'low' && itemName) {
    await supabase.from('requests').insert({
      household_id: profile.household_id,
      created_by: profile.id,
      raw_text: itemName,
      status: 'pending'
    });
    revalidatePath('/dashboard/requests')
  }

  revalidatePath('/dashboard')
}

export async function deleteItem(item_id: string): Promise<void> {
  const supabase = await createClient()
  const { profile } = await getUserProfile()

  if (!profile?.household_id) {
    console.error('No household found')
    return;
  }

  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', item_id)
    .eq('household_id', profile.household_id)

  if (error) {
    console.error(error.message)
    return;
  }

  revalidatePath('/dashboard')
}
