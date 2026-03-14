import { getCurrentUserWithProfile } from '@/utils/auth'
import type { ChatRoleResult } from '@/app/[locale]/actions/chat'
import { DashboardChatWrapper } from '@/app/[locale]/dashboard/DashboardChatWrapper'
import { DashboardTopBar } from '@/components/DashboardTopBar'

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
    <div className="bg-stone-100 text-stone-800 antialiased h-screen flex flex-col overflow-hidden">
      <DashboardTopBar profile={{ ...current.profile, email: current.email }} />
      <div className="flex-1 min-h-0 pt-0 px-3 pb-3 flex flex-col overflow-hidden bg-white">
        <DashboardChatWrapper initialChatRole={initialChatRole}>
          {children}
        </DashboardChatWrapper>
      </div>
    </div>
  )
}
