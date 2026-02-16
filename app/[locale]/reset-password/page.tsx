import { ResetPasswordForm } from './ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-xl border-2 border-palette-forest-dark overflow-hidden">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
