import { ChatModule } from '@/components/ChatModule'
import { Sidebar } from '@/components/Sidebar'
import { getCurrentUserWithProfile } from '@/utils/auth'
import type { ChatRoleResult } from '@/app/[locale]/actions/chat'

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
    <div className="bg-stone-100 text-stone-800 antialiased h-screen flex overflow-hidden p-3 gap-3">
      <Sidebar profile={{ ...current.profile, email: current.email }} />
      <div className="flex-1 min-w-0">
        {children}
      </div>
      <ChatModule initialChatRole={initialChatRole} />
    </div>
  )
}
