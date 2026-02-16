'use client'

import { Button } from '@/components/Button'

const VARIANTS = [
  { id: 'primary', label: "Créer un compte", reference: "Page d'accueil, S'inscrire" },
  { id: 'primaryDark', label: 'Enregistrer', reference: 'Modales (création entraînement)' },
  { id: 'secondary', label: 'Se connecter', reference: "Header page d'accueil" },
  { id: 'outline', label: 'Voir le détail', reference: 'Carte coach, Accepter/Refuser' },
  { id: 'muted', label: 'Annuler', reference: 'Modales, actions secondaires' },
  { id: 'ghost', label: '×', reference: 'Bouton fermer (X)' },
  { id: 'danger', label: 'Déconnexion', reference: 'Sidebar' },
  { id: 'strava', label: 'Connecter Strava', reference: 'Page login' },
] as const

type VariantId = (typeof VARIANTS)[number]['id']

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

export function ButtonShowcase() {
  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-4">
          Variantes
        </h3>
        <div className="flex flex-wrap gap-4 items-end">
          {VARIANTS.map(({ id, label, reference }) => (
            <div key={id} className="flex flex-col gap-2">
              <code className="text-xs font-mono text-stone-500">{id}</code>
              <p className="text-xs text-stone-400 -mt-1">{reference}</p>
              <Button variant={id}>
                {id === 'ghost' ? <CloseIcon /> : label}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-4">
          État désactivé
        </h3>
        <div className="flex flex-wrap gap-4">
          {VARIANTS.map(({ id, label }) => (
            <div key={id} className="flex flex-col gap-2">
              <code className="text-xs font-mono text-stone-500">{id}</code>
              <Button variant={id} disabled>
                {id === 'ghost' ? <CloseIcon /> : label}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-4">
          État chargement
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-2">
            <code className="text-xs font-mono text-stone-500">loading</code>
            <Button variant="primary" loading loadingText="Enregistrement…">
              Enregistrer
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <code className="text-xs font-mono text-stone-500">loading</code>
            <Button variant="outline" loading loadingText="Envoi en cours…">
              Envoyer la demande
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <code className="text-xs font-mono text-stone-500">loading</code>
            <Button variant="primaryDark" loading loadingText="Connexion…">
              Se connecter
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-4">
          Bouton Enregistrer — Profil, Offres, Avis coach
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Comportement complet du bouton d&apos;enregistrement (page profil, formulaire offre, notation coach).
        </p>
        {/* Contexte identique à la page profil : header avec titre + bouton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 rounded-lg bg-stone-50 border border-stone-200">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Mes informations</h2>
            <p className="text-stone-500 text-sm">Contexte comme sur la page profil.</p>
          </div>
          <Button type="button" variant="primary" success>
            Enregistrer
          </Button>
        </div>
        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex flex-col gap-2">
            <code className="text-xs font-mono text-stone-500">default</code>
            <p className="text-xs text-stone-400 -mt-1">Actif, modifications à enregistrer</p>
            <Button type="button" variant="primary">
              Enregistrer
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <code className="text-xs font-mono text-stone-500">disabled</code>
            <p className="text-xs text-stone-400 -mt-1">Aucune modification</p>
            <Button type="button" variant="primary" disabled>
              Enregistrer
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <code className="text-xs font-mono text-stone-500">loading</code>
            <p className="text-xs text-stone-400 -mt-1">En cours d&apos;envoi</p>
            <Button type="button" variant="primary" loading loadingText="Enregistrement…">
              Enregistrer
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <code className="text-xs font-mono text-stone-500">success</code>
            <p className="text-xs text-stone-400 -mt-1">Affichage temporaire après sauvegarde</p>
            <Button type="button" variant="primary" success>
              Enregistrer
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <code className="text-xs font-mono text-stone-500">error</code>
            <p className="text-xs text-stone-400 -mt-1">Échec de l&apos;enregistrement</p>
            <Button type="button" variant="primary" error>
              Enregistrer
            </Button>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-stone-50 border border-stone-200 text-sm text-stone-700">
          <p className="font-medium mb-2">Usage :</p>
          <pre className="overflow-x-auto text-xs">{`<Button
  type="submit"
  variant="primary"
  disabled={!hasUnsavedChanges || isSubmitting}
  loading={isSubmitting}
  loadingText="Enregistrement…"
  success={showSavedFeedback}
  error={!!state?.error}
>
  Enregistrer
</Button>`}</pre>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-4">
          fullWidth (primary)
        </h3>
        <div className="max-w-xs">
          <Button variant="primary" fullWidth>
            Actions pleine largeur
          </Button>
        </div>
      </div>
    </div>
  )
}
