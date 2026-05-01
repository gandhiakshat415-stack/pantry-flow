'use server';

import { createClient } from '@/utils/supabase/server';
import { getUserProfile } from '@/utils/supabase/server';

export interface RecipeAnalysisResult {
  available: string[];
  missing: string[];
  error?: string;
}

export async function analyzeRecipe(rawText: string): Promise<RecipeAnalysisResult> {
  const { profile } = await getUserProfile();

  if (!profile || !profile.household_id) {
    return { available: [], missing: [], error: 'Not authenticated or missing household' };
  }

  const supabase = await createClient();

  const { data: inventory, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('household_id', profile.household_id);

  if (error) {
    return { available: [], missing: [], error: error.message };
  }

  const available: string[] = [];
  const missing: string[] = [];

  const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  for (const line of lines) {
    const lineLower = line.toLowerCase();
    
    // Find matching inventory items
    // Case-insensitive match: line contains inventory item name
    const matchedItems = inventory.filter(item => 
      lineLower.includes(item.name.toLowerCase())
    );

    if (matchedItems.length > 0) {
      // Check if ANY matched item is full or low
      const isAvailable = matchedItems.some(item => item.status === 'full' || item.status === 'low');
      
      if (isAvailable) {
        available.push(line);
      } else {
        missing.push(line);
      }
    } else {
      // No match found
      missing.push(line);
    }
  }

  return { available, missing };
}
