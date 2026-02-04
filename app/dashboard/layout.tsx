import { ChatModule } from '@/components/ChatModule'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <ChatModule />
    </>
  )
}
