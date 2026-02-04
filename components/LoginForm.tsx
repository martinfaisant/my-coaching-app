'use client'

import { useState, useActionState } from 'react'
import {
  login,
  signup,
  type LoginState,
  type SignupState,
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

  if (mode === 'login') {
    return (
      <div className="p-6 sm:p-8">
        <h2 id="modal-title" className="text-2xl font-semibold text-slate-900 dark:text-white text-center mb-1">
          Se connecter
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6">
          Entrez vos identifiants pour accéder à votre espace
        </p>

        <form action={loginAction} className="space-y-4">
          <div>
            <label
              htmlFor="modal-email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
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
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label
              htmlFor="modal-password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
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
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-transparent transition"
            />
          </div>
          {loginState?.error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {loginState.error}
            </p>
          )}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition"
          >
            Se connecter
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      <h2 id="modal-title" className="text-2xl font-semibold text-slate-900 dark:text-white text-center mb-1">
        Créer un compte
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6">
        Choisissez votre profil puis renseignez vos informations
      </p>

      <form action={signupAction} className="space-y-4">
        <div>
          <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Je m&apos;inscris en tant que
          </span>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-4 cursor-pointer transition ${
                signupRole === 'athlete'
                  ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-600 dark:text-slate-400'
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
              <span className="text-lg font-semibold">Athlète</span>
              <span className="text-xs text-center">Suivi d&apos;entraînement</span>
            </label>
            <label
              className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-4 cursor-pointer transition ${
                signupRole === 'coach'
                  ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-600 dark:text-slate-400'
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
              <span className="text-lg font-semibold">Coach</span>
              <span className="text-xs text-center">Accompagner des athlètes</span>
            </label>
          </div>
        </div>
        <div>
          <label
            htmlFor="modal-signup-email"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
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
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label
            htmlFor="modal-signup-password"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
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
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-transparent transition"
          />
        </div>
        {signupState?.error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {signupState.error}
          </p>
        )}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition"
        >
          S&apos;inscrire
        </button>
      </form>
    </div>
  )
}
