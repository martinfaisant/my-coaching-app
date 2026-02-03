'use client'

import { useActionState } from 'react'
import {
  login,
  signup,
  type LoginState,
  type SignupState,
} from '@/app/login/actions'

export function LoginForm() {
  const [loginState, loginAction] = useActionState<LoginState, FormData>(login, {})
  const [signupState, signupAction] = useActionState<SignupState, FormData>(signup, {})

  return (
    <div className="p-6 sm:p-8">
      <h2 id="modal-title" className="text-2xl font-semibold text-slate-900 dark:text-white text-center mb-1">
        Connexion
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6">
        Connectez-vous ou créez un compte
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

      <div className="relative my-6">
        <span className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-700" />
        </span>
        <span className="relative flex justify-center text-sm text-slate-500 dark:text-slate-400">
          ou
        </span>
      </div>

      <form action={signupAction} className="space-y-4">
        <div>
          <label
            htmlFor="modal-signup-email"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Email (inscription)
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
          className="w-full py-3 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition"
        >
          S&apos;inscrire
        </button>
      </form>
    </div>
  )
}
