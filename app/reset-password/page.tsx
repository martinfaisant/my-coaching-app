import { ResetPasswordForm } from './ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-200from-stone-950to-stone-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-whitebg-stone-900 rounded-2xl shadow-xl shadow-stone-200/50shadow-black/20 border border-stone-200/80border-stone-700/80 overflow-hidden">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
