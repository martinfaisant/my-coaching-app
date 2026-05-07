import { PublicOrDashboardHeader } from '@/components/PublicOrDashboardHeader'
import { ResetPasswordForm } from './ResetPasswordForm'

export default async function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 to-stone-200">
      <PublicOrDashboardHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-palette-forest-dark overflow-hidden">
            <ResetPasswordForm />
          </div>
        </div>
      </main>
    </div>
  )
}
