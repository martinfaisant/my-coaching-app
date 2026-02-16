'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Role } from '@/types/database'
import { requireRole } from '@/lib/authHelpers'
import { getTranslations, getLocale } from 'next-intl/server'

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
  const locale = await getLocale()
  const [t, tErrors, tAuth] = await Promise.all([
    getTranslations({ locale, namespace: 'admin.members.validation' }),
    getTranslations({ locale, namespace: 'errors' }),
    getTranslations({ locale, namespace: 'auth.errors' }),
  ])
  if ('error' in result) return { error: tAuth(result.errorCode ?? 'accessDenied') }

  const targetUserId = formData.get('user_id') as string
  const newRole = formData.get('role') as Role
  if (!targetUserId || !newRole) {
    return { error: t('missingData') }
  }
  if (!['athlete', 'coach', 'admin'].includes(newRole)) {
    return { error: t('invalidRole') }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('user_id', targetUserId)

  if (error) {
    return { error: tErrors('supabaseGeneric') }
  }

  revalidatePath('/admin/members')
  revalidatePath('/dashboard')
  return { success: t('roleUpdated') }
}
