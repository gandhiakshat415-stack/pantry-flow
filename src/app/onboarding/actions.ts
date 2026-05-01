'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getUserProfile } from '@/utils/supabase/server'

export async function createHousehold(formData: FormData) {
  const supabase = await createClient()
  const { user, profile } = await getUserProfile()

  if (!user) {
    redirect('/login')
  }

  if (profile?.household_id) {
    redirect('/dashboard')
  }

  const name = formData.get('name') as string

  if (!name || name.trim() === '') {
    return { error: 'Household name is required' }
  }

  // 1. Create household
  const { data: household, error: householdError } = await supabase
    .from('households')
    .insert({ name: name.trim() })
    .select('id')
    .single()

  if (householdError || !household) {
    return { error: householdError?.message || 'Failed to create household' }
  }

  // 2. Create user profile
  const emailPrefix = user.email ? user.email.split('@')[0] : 'User'

  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: user.id,
      household_id: household.id,
      role: 'admin',
      name: emailPrefix
    })

  if (profileError) {
    return { error: profileError.message }
  }

  redirect('/dashboard')
}
