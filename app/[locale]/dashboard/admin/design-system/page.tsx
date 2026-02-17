import Link from 'next/link'
import { requireRole } from '@/utils/auth'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { ButtonShowcase } from './ButtonShowcase'
import { InputShowcase } from './InputShowcase'
import { TextareaShowcase } from './TextareaShowcase'
import { BadgeShowcase } from './BadgeShowcase'
import { ModalShowcase } from './ModalShowcase'
import { ActivityTileShowcase } from './ActivityTileShowcase'
import { TileCardShowcase } from './TileCardShowcase'
import { LanguageSwitcherShowcase } from './LanguageSwitcherShowcase'
import { LanguagePrefixFieldShowcase } from './LanguagePrefixFieldShowcase'
import { PersonTileShowcase } from './PersonTileShowcase'

const PALETTE = [
  { token: 'palette-forest-dark', hex: '#627e59', description: 'Principal — boutons, liens, focus' },
  { token: 'palette-forest-darker', hex: '#506648', description: 'Hover foncé, CTA accentués' },
  { token: 'palette-olive', hex: '#8e9856', description: 'Hover principal, avatar fallback' },
  { token: 'palette-sage', hex: '#aaaa51', description: 'Calendrier, objectif secondaire' },
  { token: 'palette-gold', hex: '#cbb44b', description: 'Calendrier, ski rando' },
  { token: 'palette-amber', hex: '#c9a544', description: 'Objectif primaire, badges' },
  { token: 'palette-strava', hex: '#FC4C02', description: 'Connexion Strava, activités importées' },
  { token: 'palette-danger', hex: '#c0564b', description: 'Actions destructives — Déconnexion, Supprimer, erreurs (Harmonie Nature)' },
  { token: 'palette-danger-light', hex: '#fdf2f1', description: 'Fond très léger, chaleureux' },
  { token: 'palette-danger-dark', hex: '#9e3b31', description: 'Interaction, plus profond' },
] as const

export default async function DesignSystemPage() {
  await requireRole(['admin'])

  return (
    <DashboardPageShell
      title="Design System"
      rightContent={
        <Link
          href="/admin/members"
          className="text-sm font-medium text-stone-500 hover:text-palette-forest-dark"
        >
          Membres
        </Link>
      }
      contentClassName="py-8"
    >
        <p className="mb-8 text-stone-600">
          Référence des tokens et composants. Priorité : utiliser ces tokens plutôt que des couleurs hex en dur.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            Palette de couleurs
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PALETTE.map(({ token, hex, description }) => (
              <div
                key={token}
                className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="h-24 w-full"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
                <div className="p-4">
                  <code className="text-sm font-mono font-medium text-stone-800">
                    {token}
                  </code>
                  <p className="mt-0.5 text-xs text-stone-500 font-mono">
                    {hex}
                  </p>
                  <p className="mt-2 text-sm text-stone-600">
                    {description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-block rounded px-2 py-0.5 text-[10px] font-mono bg-stone-100 text-stone-600">
                      bg-{token}
                    </span>
                    <span className="inline-block rounded px-2 py-0.5 text-[10px] font-mono bg-stone-100 text-stone-600">
                      text-{token}
                    </span>
                    <span className="inline-block rounded px-2 py-0.5 text-[10px] font-mono bg-stone-100 text-stone-600">
                      border-{token}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            Composant Button
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            Variantes alignées sur les boutons existants de l&apos;app : Créer un compte, Enregistrer (modale entraînement), Se connecter, Déconnexion.
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <ButtonShowcase />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            Composants Input / Textarea
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            Champs de formulaire alignés sur LoginForm, ProfileForm, WorkoutModal.
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <div className="space-y-12">
              <div>
                <h3 className="text-base font-semibold text-stone-800 mb-4">Input</h3>
                <InputShowcase />
              </div>
              <div className="pt-8 border-t border-stone-200">
                <h3 className="text-base font-semibold text-stone-800 mb-4">Textarea</h3>
                <TextareaShowcase />
              </div>
              <div className="pt-8 border-t border-stone-200">
                <h3 className="text-base font-semibold text-stone-800 mb-4">Champ avec préfixe langue (EN/FR)</h3>
                <LanguagePrefixFieldShowcase />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            Composant Badge
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            Étiquettes pour sports, langues, objectifs, statuts. Variantes default, primary, sport-*, success, warning. Tuiles cliquables : états statique, non sélectionné, sélectionné (profil coach).
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <BadgeShowcase />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            Composant ActivityTile
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            Tuiles d&apos;activités unifiées pour entraînements planifiés, activités Strava importées et objectifs de course. Style inspiré de Strava avec bordure gauche colorée adaptée au type d&apos;activité.
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <ActivityTileShowcase />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            Composant TileCard
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            Conteneur avec le même style de tour (bordure) que les tuiles de la modale « Activités du jour ». Pour objectifs, listes personnalisées, etc.
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <TileCardShowcase />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            Tuiles Coach et Athlète (CoachTile / AthleteTile)
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            Tuiles de liste au design unifié : carte rounded-2xl, header (avatar + nom), badges sports, zone contenu, footer d’action. CoachTile pour « Trouver un coach », AthleteTile pour « Mes athlètes ».
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <PersonTileShowcase />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            Composant Modal
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            Modales réutilisables avec overlay, gestion Escape, tailles variées (sm à 4xl), support icône, footer, et alignements.
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <ModalShowcase />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            Composant LanguageSwitcher
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            Dropdown de changement de langue (FR/EN) avec icône globe, libellés « Français » / « English » et coche sur la langue active. Conforme au design system (tokens palette, stone).
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <LanguageSwitcherShowcase />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            Aperçu des classes Tailwind
          </h2>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <div className="flex flex-wrap gap-4 items-center">
              {PALETTE.map(({ token, hex }) => (
                <div key={token} className="flex flex-col items-center gap-1">
                  <div
                    className="h-12 w-12 rounded-lg"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-xs text-stone-500">{token.replace('palette-', '')}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </DashboardPageShell>
  )
}
