'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LoginModal } from '@/components/LoginModal'

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
            <Link
              href="/"
              className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight"
            >
              Coach Pro
            </Link>
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="rounded-xl bg-slate-900 dark:bg-white px-5 py-2.5 text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Connexion
            </button>
          </div>
        </header>

        {/* Hero - Présentation du coach */}
        <main className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24">
          <section className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-16">
            <div className="flex-shrink-0">
              <div className="h-48 w-48 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                <span className="text-6xl font-bold text-white/90">JP</span>
              </div>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                Coach sportif personnel
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Jean-Pierre Martin
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl">
                Coach diplômé avec plus de 10 ans d&apos;expérience, je vous accompagne pour
                atteindre vos objectifs : perte de poids, prise de masse, préparation
                physique ou simplement une meilleure condition au quotidien.
              </p>
              <ul className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Musculation &amp; fitness
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Nutrition
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Suivi personnalisé
                </li>
              </ul>
            </div>
          </section>

          {/* Section valeurs / approche */}
          <section className="mt-24 grid gap-8 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Objectifs sur mesure
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Chaque programme est conçu selon votre niveau, votre emploi du temps et
                vos objectifs.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Suivi régulier
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Bilan régulier et ajustements pour garder la motivation et progresser
                durablement.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                En présentiel ou en ligne
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Séances en salle, à domicile ou coaching à distance selon vos préférences.
              </p>
            </div>
          </section>

          <div className="mt-16 text-center">
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="rounded-xl bg-emerald-600 dark:bg-emerald-500 px-8 py-3.5 text-base font-medium text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Accéder à mon espace coaching
            </button>
          </div>
        </main>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  )
}
