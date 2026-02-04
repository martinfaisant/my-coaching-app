'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LoginModal } from '@/components/LoginModal'

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'login' | 'signup'>('login')

  const openLogin = () => {
    setModalMode('login')
    setModalOpen(true)
  }
  const openSignup = () => {
    setModalMode('signup')
    setModalOpen(true)
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-stone-200 bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link
              href="/"
              className="text-xl font-semibold text-stone-900 tracking-tight"
            >
              Coach Pro
            </Link>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={openLogin}
                className="rounded-lg px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 transition-colors"
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={openSignup}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors" style={{ backgroundColor: '#627e59' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8e9856'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#627e59'}
              >
                Créer un compte
              </button>
            </div>
          </div>
        </header>

        {/* Hero - Présentation du coach */}
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <section className="flex flex-col items-center gap-16 lg:flex-row lg:items-start lg:gap-20">
            <div className="flex-shrink-0">
              <div className="h-40 w-40 rounded-3xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #627e59, #8e9856)', boxShadow: '0 10px 15px -3px rgba(98, 126, 89, 0.1)' }}>
                <span className="text-5xl font-bold text-white">JP</span>
              </div>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: '#627e59' }}>
                Coach sportif personnel
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 mb-5">
                Jean-Pierre Martin
              </h1>
              <p className="text-lg leading-relaxed text-stone-700 max-w-2xl mb-8">
                Coach diplômé avec plus de 10 ans d&apos;expérience, je vous accompagne pour
                atteindre vos objectifs : perte de poids, prise de masse, préparation
                physique ou simplement une meilleure condition au quotidien.
              </p>
              <ul className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-stone-700">
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#627e59' }} />
                  Musculation &amp; fitness
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#627e59' }} />
                  Nutrition
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#627e59' }} />
                  Suivi personnalisé
                </li>
              </ul>
            </div>
          </section>

          {/* Section valeurs / approche */}
          <section className="mt-32 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-stone-300 p-6" style={{ backgroundColor: 'var(--card-bg)' }}>
              <h3 className="text-base font-semibold text-stone-900 mb-2">
                Objectifs sur mesure
              </h3>
              <p className="text-sm leading-relaxed text-stone-700">
                Chaque programme est conçu selon votre niveau, votre emploi du temps et
                vos objectifs.
              </p>
            </div>
            <div className="rounded-xl border border-stone-300 p-6" style={{ backgroundColor: 'var(--card-bg)' }}>
              <h3 className="text-base font-semibold text-stone-900 mb-2">
                Suivi régulier
              </h3>
              <p className="text-sm leading-relaxed text-stone-700">
                Bilan régulier et ajustements pour garder la motivation et progresser
                durablement.
              </p>
            </div>
            <div className="rounded-xl border border-stone-300 p-6" style={{ backgroundColor: 'var(--card-bg)' }}>
              <h3 className="text-base font-semibold text-stone-900 mb-2">
                En présentiel ou en ligne
              </h3>
              <p className="text-sm leading-relaxed text-stone-700">
                Séances en salle, à domicile ou coaching à distance selon vos préférences.
              </p>
            </div>
          </section>

        </main>
      </div>

      <LoginModal
        isOpen={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
