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
