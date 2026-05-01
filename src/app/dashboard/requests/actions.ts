'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { getUserProfile } from '@/utils/supabase/server';

export async function createRequest(formData: FormData) {
  const { profile } = await getUserProfile();

  if (!profile || !profile.household_id) {
    return { error: 'Not authenticated or missing household' };
  }

  const raw_text = formData.get('raw_text');

  if (!raw_text || typeof raw_text !== 'string') {
    return { error: 'Request text is required' };
  }

  const supabase = await createClient();

  const { error } = await supabase.from('requests').insert({
    household_id: profile.household_id,
    created_by: profile.id,
    raw_text: raw_text,
    status: 'pending'
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/requests');
  return { success: true };
}

export async function updateRequestStatus(request_id: string, new_status: 'pending' | 'in_cart' | 'fulfilled') {
  const { profile } = await getUserProfile();

  if (!profile || !profile.household_id) {
    return { error: 'Not authenticated or missing household' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('requests')
    .update({ status: new_status })
    .eq('id', request_id)
    .eq('household_id', profile.household_id); // Safety check

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/requests');
  return { success: true };
}
