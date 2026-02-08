import { ChatModule } from '@/components/ChatModule'
import { getCurrentUserWithProfile } from '@/utils/auth'
import type { ChatRoleResult } from '@/app/actions/chat'

function getChatRoleFromProfile(profile: { role: string; coach_id: string | null }, userId: string): ChatRoleResult {
  if (profile.role === 'coach') return { role: 'coach', userId }
  if (profile.role === 'athlete') return { role: 'athlete', userId, hasCoach: !!profile.coach_id }
  return null
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const current = await getCurrentUserWithProfile()
  const initialChatRole = getChatRoleFromProfile(current.profile, current.id)

  return (
    <>
      {children}
      <ChatModule initialChatRole={initialChatRole} />
    </>
  )
}
