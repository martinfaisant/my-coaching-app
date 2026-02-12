'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LoginModal } from '@/components/LoginModal'
import { Button } from '@/components/Button'

const HERO_CARDS = [
  {
    src: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80',
    alt: 'Coureur sur route',
    title: 'Trouvez votre coach',
    description:
      'Parcourez les profils de coachs professionnels (sports, langues, présentation) et envoyez une demande pour démarrer un accompagnement.',
  },
  {
    src: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80',
    alt: 'Cycliste',
    title: 'Suivi et plans sur mesure',
    description:
      "Objectifs, calendrier d'entraînement et suivi régulier pour progresser avec un coach dédié.",
  },
  {
    src: 'https://images.unsplash.com/photo-1504025468847-0e438279542c?w=800&q=80',
    alt: 'Traileur en montagne',
    title: 'Échange en direct',
    description:
      'Messagerie intégrée entre athlète et coach pour poser vos questions et ajuster le programme à tout moment.',
  },
] as const

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
              <Button variant="secondary" onClick={openLogin}>
                Se connecter
              </Button>
              <Button variant="primary" onClick={openSignup}>
                Créer un compte
              </Button>
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

          {/* Image + texte en bloc uni, hauteur texte égale — Unsplash (libre de droit) */}
          <section className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8" aria-label="Atouts de la plateforme">
            {HERO_CARDS.map(({ src, alt, title, description }) => (
              <article
                key={title}
                className="flex flex-col rounded-2xl border border-stone-200 overflow-hidden bg-section shadow-md"
              >
                <div className="group relative flex-none">
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-base font-semibold text-stone-900 mb-2">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-700">
                    {description}
                  </p>
                </div>
              </article>
            ))}
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
