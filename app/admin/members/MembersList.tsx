'use client'

import { useActionState } from 'react'
import { updateMemberRole, type UpdateRoleState } from './actions'
import type { Profile } from '@/types/database'
import type { Role } from '@/types/database'

const ROLE_LABELS: Record<Role, string> = {
  athlete: 'Athlète',
  coach: 'Coach',
  admin: 'Admin',
}

type MembersListProps = {
  profiles: Pick<Profile, 'user_id' | 'email' | 'full_name' | 'role' | 'coach_id' | 'created_at'>[]
}

export function MembersList({ profiles }: MembersListProps) {
  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Rôle
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {profiles.map((profile) => (
              <MemberRow key={profile.user_id} profile={profile} />
            ))}
          </tbody>
        </table>
      </div>
      {profiles.length === 0 && (
        <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
          Aucun membre.
        </div>
      )}
    </div>
  )
}

function MemberRow({
  profile,
}: {
  profile: Pick<Profile, 'user_id' | 'email' | 'role'>
}) {
  const [state, formAction] = useActionState<UpdateRoleState, FormData>(updateMemberRole, {})

  return (
    <tr className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50">
      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
        {profile.email}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
        {ROLE_LABELS[profile.role]}
      </td>
      <td className="px-4 py-3">
        <form action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="user_id" value={profile.user_id} />
          <select
            name="role"
            defaultValue={profile.role}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <option value="athlete">Athlète</option>
            <option value="coach">Coach</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 dark:bg-white px-3 py-1.5 text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition"
          >
            Modifier
          </button>
        </form>
        {state?.error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{state.error}</p>
        )}
        {state?.success && (
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{state.success}</p>
        )}
      </td>
    </tr>
  )
}
