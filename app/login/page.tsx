'use client'

import { useState, useActionState } from 'react'
import { login, signup, type LoginState, type SignupState } from './actions'

type SignupRole = 'athlete' | 'coach'

export default function LoginPage() {
  const [loginState, loginAction] = useActionState<LoginState, FormData>(login, {})
  const [signupState, signupAction] = useActionState<SignupState, FormData>(signup, {})
  const [signupRole, setSignupRole] = useState<SignupRole>('athlete')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-200from-stone-950to-stone-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50shadow-black/20 border border-2 border-palette-forest-dark overflow-hidden">
          <div className="p-8 sm:p-10">
            <h1 className="text-2xl font-semibold text-stone-900text-white text-center mb-1">
              Connexion
            </h1>
            <p className="text-white0text-stone-400 text-sm text-center mb-8">
              Connectez-vous ou créez un compte
            </p>

            <form action={loginAction} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-stone-700text-stone-300 mb-1.5"
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
                  className="w-full px-4 py-3 rounded-xl border border-stone-300border-stone-600 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-stone-700text-stone-300 mb-1.5"
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
                  className="w-full px-4 py-3 rounded-xl border border-stone-300border-stone-600 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition"
                />
              </div>
              {loginState?.error && (
                <p className="text-sm text-red-600text-red-400" role="alert">
                  {loginState.error}
                </p>
              )}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-stone-900bg-white text-whitetext-stone-900 font-medium hover:bg-palette-olivehover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition"
              >
                Se connecter
              </button>
            </form>

            <div className="relative my-8">
              <span className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-palette-forest-dark" />
              </span>
              <span className="relative flex justify-center text-sm text-white0text-stone-400">
                ou
              </span>
            </div>

            <form action={signupAction} className="space-y-5">
              <p className="text-sm font-medium text-stone-700text-stone-300">
                Créer mon compte
              </p>
              <div>
                <span className="block text-sm font-medium text-stone-700text-stone-300 mb-2">
                  Je m&apos;inscris en tant que
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-4 cursor-pointer transition ${
                      signupRole === 'athlete'
                        ? 'border-stone-900border-white bg-stone-100bg-stone-800 text-stone-900text-white'
                        : 'border-stone-200border-stone-600 hover:border-stone-300hover:border-stone-500 text-stone-600text-stone-400'
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
                        ? 'border-stone-900border-white bg-stone-100bg-stone-800 text-stone-900text-white'
                        : 'border-stone-200border-stone-600 hover:border-stone-300hover:border-stone-500 text-stone-600text-stone-400'
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
                  htmlFor="signup-email"
                  className="block text-sm font-medium text-stone-700text-stone-300 mb-1.5"
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
                  className="w-full px-4 py-3 rounded-xl border border-stone-300border-stone-600 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition"
                />
              </div>
              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-sm font-medium text-stone-700text-stone-300 mb-1.5"
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
                  className="w-full px-4 py-3 rounded-xl border border-stone-300border-stone-600 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition"
                />
              </div>
              {signupState?.error && (
                <p className="text-sm text-red-600text-red-400" role="alert">
                  {signupState.error}
                </p>
              )}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-stone-200bg-stone-700 text-stone-900text-white font-medium hover:bg-stone-300hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition"
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
