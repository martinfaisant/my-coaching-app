'use client'

import { useActionState } from 'react'
import { login, signup, type LoginState, type SignupState } from './actions'

export default function LoginPage() {
  const [loginState, loginAction] = useActionState<LoginState, FormData>(login, {})
  const [signupState, signupAction] = useActionState<SignupState, FormData>(signup, {})

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
          <div className="p-8 sm:p-10">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white text-center mb-1">
              Connexion
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-8">
              Connectez-vous ou créez un compte
            </p>

            <form action={loginAction} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
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
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Mot de passe
                </label>
                <input
                  id="password"
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

            <div className="relative my-8">
              <span className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
              </span>
              <span className="relative flex justify-center text-sm text-slate-500 dark:text-slate-400">
                ou
              </span>
            </div>

            <form action={signupAction} className="space-y-5">
              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Email (inscription)
                </label>
                <input
                  id="signup-email"
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
                  htmlFor="signup-password"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Mot de passe (min. 6 caractères)
                </label>
                <input
                  id="signup-password"
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
        </div>
      </div>
    </div>
  )
}
