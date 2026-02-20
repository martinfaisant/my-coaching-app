'use client'

import { useActionState } from 'react'
import { updateMemberRole, type UpdateRoleState } from './actions'
import { Button } from '@/components/Button'
import type { Profile } from '@/types/database'
import type { Role } from '@/types/database'

const ROLE_LABELS: Record<Role, string> = {
  athlete: 'Athlète',
  coach: 'Coach',
  admin: 'Admin',
}

type MembersListProps = {
  profiles: Pick<Profile, 'user_id' | 'email' | 'first_name' | 'last_name' | 'role' | 'coach_id' | 'created_at'>[]
}

const ROLES: Role[] = ['athlete', 'coach', 'admin']

export function MembersList({ profiles }: MembersListProps) {
  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      {profiles.length === 0 ? (
        <div className="px-4 py-8 text-center text-stone-500">
          Aucun membre.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-400">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-400">
                  Rôle
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {profiles.map((profile) => (
                <MemberRow key={profile.user_id} profile={profile} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function MemberRow({
  profile,
}: {
  profile: Pick<Profile, 'user_id' | 'email' | 'first_name' | 'last_name' | 'role'>
}) {
  const [state, formAction] = useActionState<UpdateRoleState, FormData>(updateMemberRole, {})

  return (
    <tr className="bg-white hover:bg-stone-50">
      <td className="px-4 py-3 text-sm text-stone-900">
        {profile.email}
      </td>
      <td className="px-4 py-3 text-sm text-stone-600">
        {ROLE_LABELS[profile.role]}
      </td>
      <td className="px-4 py-3">
        <form action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="user_id" value={profile.user_id} />
          <select
            name="role"
            defaultValue={profile.role}
            className="rounded-lg border-2 border-palette-forest-dark bg-white px-3 py-1.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-palette-olive"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
          <Button type="submit" variant="primary">
            Modifier
          </Button>
        </form>
        {state?.error && (
          <p className="mt-1 text-xs text-red-600">{state.error}</p>
        )}
        {state?.success && (
          <p className="mt-1 text-xs text-palette-forest-dark">{state.success}</p>
        )}
      </td>
    </tr>
  )
}
