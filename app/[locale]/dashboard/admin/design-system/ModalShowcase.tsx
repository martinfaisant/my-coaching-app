'use client'

import { useState } from 'react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'

export function ModalShowcase() {
  const [simpleOpen, setSimpleOpen] = useState(false)
  const [withIconOpen, setWithIconOpen] = useState(false)
  const [withFooterOpen, setWithFooterOpen] = useState(false)
  const [largeOpen, setLargeOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="space-y-8">
      {/* Boutons pour ouvrir les modales */}
      <div>
        <h4 className="text-sm font-semibold text-stone-700 mb-3">Variantes</h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setSimpleOpen(true)}>
            Simple (md)
          </Button>
          <Button variant="outline" onClick={() => setWithIconOpen(true)}>
            Avec icône
          </Button>
          <Button variant="outline" onClick={() => setWithFooterOpen(true)}>
            Avec footer
          </Button>
          <Button variant="outline" onClick={() => setLargeOpen(true)}>
            Large (2xl)
          </Button>
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            Confirmation (sm)
          </Button>
        </div>
      </div>

      {/* Modale simple */}
      <Modal
        isOpen={simpleOpen}
        onClose={() => setSimpleOpen(false)}
        title="Modale simple"
      >
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-stone-600">
            Ceci est une modale de taille moyenne (md) avec un titre et un contenu simple.
          </p>
          <p className="text-sm text-stone-600">
            Le bouton X permet de fermer, tout comme Escape ou un clic sur l&apos;overlay.
          </p>
        </div>
      </Modal>

      {/* Modale avec icône */}
      <Modal
        isOpen={withIconOpen}
        onClose={() => setWithIconOpen(false)}
        title="Avec icône"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      >
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-stone-600">
            Modale avec icône dans le header (cercle vert avec check).
          </p>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <p className="text-xs text-stone-500">
              L&apos;icône est affichée à gauche du titre dans un badge coloré.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modale avec footer */}
      <Modal
        isOpen={withFooterOpen}
        onClose={() => setWithFooterOpen(false)}
        title="Modale avec footer"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        }
        footer={
          <div className="flex gap-3 w-full">
            <Button
              variant="muted"
              onClick={() => setWithFooterOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              variant="primaryDark"
              onClick={() => setWithFooterOpen(false)}
              className="flex-1"
            >
              Enregistrer
            </Button>
          </div>
        }
      >
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-stone-600">
            Cette modale contient un footer avec boutons d&apos;action.
          </p>
          <p className="text-sm text-stone-600">
            Le footer est fixe en bas (ne scroll pas) et utilise un fond gris clair.
          </p>
        </div>
      </Modal>

      {/* Modale large */}
      <Modal
        isOpen={largeOpen}
        onClose={() => setLargeOpen(false)}
        title="Modale large"
        size="2xl"
      >
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-stone-600">
            Modale de taille 2xl (672px) pour du contenu plus riche.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
              <h5 className="text-sm font-semibold text-stone-900 mb-2">Colonne 1</h5>
              <p className="text-xs text-stone-600">Contenu de la première colonne.</p>
            </div>
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
              <h5 className="text-sm font-semibold text-stone-900 mb-2">Colonne 2</h5>
              <p className="text-xs text-stone-600">Contenu de la deuxième colonne.</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modale confirmation */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmer la suppression ?"
        size="sm"
        footer={
          <div className="flex gap-3 w-full">
            <Button
              variant="muted"
              onClick={() => setConfirmOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={() => setConfirmOpen(false)}
              className="flex-1"
            >
              Supprimer
            </Button>
          </div>
        }
      >
        <div className="px-6 py-4">
          <p className="text-sm text-stone-600">
            Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cet élément ?
          </p>
        </div>
      </Modal>

      {/* Documentation */}
      <div className="mt-8 pt-8 border-t border-stone-200">
        <h4 className="text-sm font-semibold text-stone-700 mb-3">Tailles disponibles</h4>
        <div className="grid gap-2 text-xs text-stone-600">
          <div><code className="bg-stone-100 px-2 py-0.5 rounded">sm</code> — 384px (confirmations)</div>
          <div><code className="bg-stone-100 px-2 py-0.5 rounded">md</code> — 448px (défaut, formulaires)</div>
          <div><code className="bg-stone-100 px-2 py-0.5 rounded">lg</code> — 512px</div>
          <div><code className="bg-stone-100 px-2 py-0.5 rounded">xl</code> — 576px</div>
          <div><code className="bg-stone-100 px-2 py-0.5 rounded">2xl</code> — 672px</div>
          <div><code className="bg-stone-100 px-2 py-0.5 rounded">3xl</code> — 768px</div>
          <div><code className="bg-stone-100 px-2 py-0.5 rounded">4xl</code> — 896px (détails coach)</div>
          <div><code className="bg-stone-100 px-2 py-0.5 rounded">full</code> — 95vw (chat, panels)</div>
        </div>
      </div>
    </div>
  )
}
