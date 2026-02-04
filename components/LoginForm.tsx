'use client'

import { useState, useActionState } from 'react'
import {
  login,
  signup,
  resetPassword,
  type LoginState,
  type SignupState,
  type ResetPasswordState,
} from '@/app/login/actions'
import type { AuthModalMode } from './LoginModal'

type SignupRole = 'athlete' | 'coach'

type LoginFormProps = {
  mode: AuthModalMode
}

export function LoginForm({ mode }: LoginFormProps) {
  const [loginState, loginAction] = useActionState<LoginState, FormData>(login, {})
  const [signupState, signupAction] = useActionState<SignupState, FormData>(signup, {})
  const [signupRole, setSignupRole] = useState<SignupRole>('athlete')
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  if (mode === 'login' && showForgotPassword) {
    return (
      <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
    )
  }

  if (mode === 'login') {
    return (
      <div className="p-8">
        <h2 id="modal-title" className="text-2xl font-semibold text-stone-900 text-center mb-2">
          Se connecter
        </h2>
        <p className="text-white0 text-sm text-center mb-8">
          Entrez vos identifiants pour accéder à votre espace
        </p>

        <form action={loginAction} className="space-y-5">
          <div>
            <label
              htmlFor="modal-email"
              className="block text-sm font-medium text-stone-700 mb-2"
            >
              Email
            </label>
            <input
              id="modal-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="vous@exemple.com"
              className="w-full px-4 py-2.5 rounded-lg border border-stone-200border-stone-700 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition"
            />
          </div>
          <div>
            <label
              htmlFor="modal-password"
              className="block text-sm font-medium text-stone-700 mb-2"
            >
              Mot de passe
            </label>
            <input
              id="modal-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-stone-200border-stone-700 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition"
            />
          </div>
          {loginState?.error && (
            <p className="text-sm text-red-600text-red-400" role="alert">
              {loginState.error}
            </p>
          )}
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-palette-forest-dark text-white font-medium hover:bg-palette-olive transition-colors"
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="w-full text-sm text-white0 hover:text-stone-700 transition-colors"
          >
            Mot de passe oublié
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h2 id="modal-title" className="text-2xl font-semibold text-stone-900 text-center mb-2">
        Créer un compte
      </h2>
      <p className="text-white0 text-sm text-center mb-8">
        Choisissez votre profil puis renseignez vos informations
      </p>

      <form action={signupAction} className="space-y-5">
        <div>
          <span className="block text-sm font-medium text-stone-700 mb-3">
            Je m&apos;inscris en tant que
          </span>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                signupRole === 'athlete'
                  ? 'border-stone-900border-white bg-stone-50 text-stone-900 shadow-sm'
                  : 'border-stone-200border-stone-700 hover:border-stone-300hover:border-stone-600 text-stone-600'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="athlete"
                checked={signupRole === 'athlete'}
                onChange={() => setSignupRole('athlete')}
                className="sr-only"
              />
              <span className="text-base font-semibold">Athlète</span>
              <span className="text-xs text-center">Suivi d&apos;entraînement</span>
            </label>
            <label
              className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                signupRole === 'coach'
                  ? 'border-stone-900border-white bg-stone-50 text-stone-900 shadow-sm'
                  : 'border-stone-200border-stone-700 hover:border-stone-300hover:border-stone-600 text-stone-600'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="coach"
                checked={signupRole === 'coach'}
                onChange={() => setSignupRole('coach')}
                className="sr-only"
              />
              <span className="text-base font-semibold">Coach</span>
              <span className="text-xs text-center">Accompagner des athlètes</span>
            </label>
          </div>
        </div>
        <div>
          <label
            htmlFor="modal-signup-email"
            className="block text-sm font-medium text-stone-700 mb-2"
          >
            Email
          </label>
          <input
            id="modal-signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="vous@exemple.com"
            className="w-full px-4 py-2.5 rounded-lg border border-stone-200border-stone-700 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition"
          />
        </div>
        <div>
          <label
            htmlFor="modal-signup-password"
            className="block text-sm font-medium text-stone-700 mb-2"
          >
            Mot de passe (min. 6 caractères)
          </label>
          <input
            id="modal-signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg border border-stone-200border-stone-700 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition"
          />
        </div>
        {signupState?.error && (
          <p className="text-sm text-red-600text-red-400" role="alert">
            {signupState.error}
          </p>
        )}
        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-lg bg-palette-forest-dark text-white font-medium hover:bg-palette-olive transition-colors"
        >
          S&apos;inscrire
        </button>
      </form>
    </div>
  )
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [resetState, resetAction] = useActionState<ResetPasswordState, FormData>(resetPassword, {})

  return (
    <div className="p-8">
      <h2 id="modal-title" className="text-2xl font-semibold text-stone-900 text-center mb-2">
        Mot de passe oublié
      </h2>
      <p className="text-white0 text-sm text-center mb-8">
        Entrez votre adresse email. Un lien de réinitialisation vous sera envoyé.
      </p>

      <form action={resetAction} className="space-y-5">
        <div>
          <label
            htmlFor="reset-email"
            className="block text-sm font-medium text-stone-700 mb-2"
          >
            Email
          </label>
          <input
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="vous@exemple.com"
            className="w-full px-4 py-2.5 rounded-lg border border-stone-200border-stone-700 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition"
          />
        </div>
        {resetState?.error && (
          <p className="text-sm text-red-600text-red-400" role="alert">
            {resetState.error}
          </p>
        )}
        {resetState?.success && (
          <p className="text-sm text-palette-forest-dark" role="alert">
            {resetState.success}
          </p>
        )}
        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-lg bg-palette-forest-dark text-white font-medium hover:bg-palette-olive transition-colors"
        >
          Envoyer le lien de réinitialisation
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-sm text-white0 hover:text-stone-700 transition-colors"
        >
          ← Retour à la connexion
        </button>
      </form>
    </div>
  )
}
