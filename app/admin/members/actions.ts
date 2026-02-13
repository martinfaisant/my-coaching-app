'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Role } from '@/types/database'
import { requireRole } from '@/lib/authHelpers'

export type UpdateRoleState = {
  error?: string
  success?: string
}

export async function updateMemberRole(
  _prevState: UpdateRoleState,
  formData: FormData
): Promise<UpdateRoleState> {
  const supabase = await createClient()
  const result = await requireRole(supabase, 'admin')
  if ('error' in result) return { error: result.error }

  const targetUserId = formData.get('user_id') as string
  const newRole = formData.get('role') as Role
  if (!targetUserId || !newRole) {
    return { error: 'Données manquantes.' }
  }
  if (!['athlete', 'coach', 'admin'].includes(newRole)) {
    return { error: 'Rôle invalide.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('user_id', targetUserId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/members')
  revalidatePath('/dashboard')
  return { success: 'Rôle mis à jour.' }
}
