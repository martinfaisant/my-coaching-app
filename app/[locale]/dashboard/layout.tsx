import { Sidebar } from '@/components/Sidebar'
import { getCurrentUserWithProfile } from '@/utils/auth'
import type { ChatRoleResult } from '@/app/[locale]/actions/chat'
import { DashboardChatWrapper } from '@/app/[locale]/dashboard/DashboardChatWrapper'

function getChatRoleFromProfile(profile: { role: string }, userId: string): ChatRoleResult {
  if (profile.role === 'coach') return { role: 'coach', userId }
  if (profile.role === 'athlete') return { role: 'athlete', userId }
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
      <DashboardChatWrapper initialChatRole={initialChatRole}>
        {children}
      </DashboardChatWrapper>
    </div>
  )
}
