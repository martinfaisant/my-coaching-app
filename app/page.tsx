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

        {/* Hero - Présentation du produit */}
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <section className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-medium uppercase tracking-widest mb-3 text-palette-forest-dark">
              La plateforme de coaching sportif
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 mb-6">
              Progressez avec la bonne personne !
            </h1>
            <p className="text-lg leading-relaxed text-stone-700">
              Coach Pro met en relation sportifs et coachs professionnels pour un suivi
              personnalisé : plans d&apos;entraînement, objectifs et échanges en direct,
              le tout dans un espace dédié.
            </p>
          </section>

          {/* Section objectifs / atouts */}
          <section className="mt-24 sm:mt-32 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-stone-300 p-6 bg-section">
              <h3 className="text-base font-semibold text-stone-900 mb-2">
                Trouvez votre coach
              </h3>
              <p className="text-sm leading-relaxed text-stone-700">
                Parcourez les profils de coachs professionnels (sports, langues, présentation)
                et envoyez une demande pour démarrer un accompagnement.
              </p>
            </div>
            <div className="rounded-xl border border-stone-300 p-6 bg-section">
              <h3 className="text-base font-semibold text-stone-900 mb-2">
                Suivi et plans sur mesure
              </h3>
              <p className="text-sm leading-relaxed text-stone-700">
                Objectifs, calendrier d&apos;entraînement et suivi régulier pour progresser
                avec un coach dédié.
              </p>
            </div>
            <div className="rounded-xl border border-stone-300 p-6 bg-section">
              <h3 className="text-base font-semibold text-stone-900 mb-2">
                Échange en direct
              </h3>
              <p className="text-sm leading-relaxed text-stone-700">
                Messagerie intégrée entre athlète et coach pour poser vos questions
                et ajuster le programme à tout moment.
              </p>
            </div>
          </section>

        </main>
      </div>

      <LoginModal
        isOpen={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onModeChange={setModalMode}
      />
    </>
  )
}
