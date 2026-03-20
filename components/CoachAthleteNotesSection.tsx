'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { TileCard } from '@/components/TileCard'
import { Button } from '@/components/Button'
import { CoachAthleteNoteModal } from '@/components/CoachAthleteNoteModal'
import type { CoachAthleteNote } from '@/types/database'
import { deleteCoachAthleteNote } from '@/app/[locale]/dashboard/athletes/[athleteId]/coachNotesActions'
import { isError } from '@/lib/errors'

type CoachAthleteNotesSectionProps = {
  athleteId: string
  initialNotes: CoachAthleteNote[]
  onNotesChanged: () => void
}

export function CoachAthleteNotesSection ({ athleteId, initialNotes, onNotesChanged }: CoachAthleteNotesSectionProps) {
  const t = useTranslations('coachAthleteNotes')
  const tCommon = useTranslations('common')
  const [modalOpen, setModalOpen] = useState(false)
  const [noteToEdit, setNoteToEdit] = useState<CoachAthleteNote | null>(null)
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)
  const [deleteErrorById, setDeleteErrorById] = useState<Record<string, string>>({})

  const openCreate = () => {
    setNoteToEdit(null)
    setModalOpen(true)
  }

  const openEdit = (note: CoachAthleteNote) => {
    setNoteToEdit(note)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  const handleDeleteCard = async (note: CoachAthleteNote) => {
    if (deleteLoadingId) return
    if (!window.confirm(t('deleteConfirm'))) return

    setDeleteLoadingId(note.id)
    setDeleteErrorById((prev) => {
      const next = { ...prev }
      delete next[note.id]
      return next
    })

    const result = await deleteCoachAthleteNote({ athleteId, noteId: note.id })
    if (isError(result)) {
      setDeleteErrorById((prev) => ({ ...prev, [note.id]: result.error }))
      setDeleteLoadingId(null)
      return
    }

    setDeleteLoadingId(null)
    onNotesChanged()
  }

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={openCreate}
          className="w-full rounded-xl border-2 border-dashed border-palette-forest-dark/35 bg-palette-forest-dark/5 hover:bg-palette-forest-dark/10 transition flex items-center justify-center gap-2 px-4 py-4 text-sm font-bold text-palette-forest-dark"
        >
          <span className="text-lg leading-none" aria-hidden>
            +
          </span>
          {t('newNote')}
        </button>

        {initialNotes.length === 0 ? (
          <div className="rounded-2xl p-6 border border-stone-200 bg-stone-50/80 text-center">
            <p className="text-sm font-semibold text-stone-700">{t('emptyTitle')}</p>
            <p className="mt-2 text-sm text-stone-500 max-w-md mx-auto">{t('emptyDescription')}</p>
          </div>
        ) : (
          initialNotes.map((note) => (
            <TileCard key={note.id} leftBorderColor="sage" className="!p-0 overflow-hidden">
              <div className="p-4 min-w-0">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <h3 className="text-sm font-bold text-stone-900">{note.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Button type="button" variant="muted" className="!min-h-9 !py-1.5 !text-sm" onClick={() => openEdit(note)}>
                        {t('edit')}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="!min-h-9 !py-1.5 !text-sm"
                        loading={deleteLoadingId === note.id}
                        loadingText={tCommon('deleting')}
                        onClick={() => void handleDeleteCard(note)}
                      >
                        {t('delete')}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed whitespace-pre-wrap">{note.body}</p>
                  {deleteErrorById[note.id] && (
                    <p className="text-sm text-palette-danger-dark" role="alert">
                      {deleteErrorById[note.id]}
                    </p>
                  )}
                </div>
              </div>
            </TileCard>
          ))
        )}
      </div>

      <CoachAthleteNoteModal
        key={modalOpen ? noteToEdit?.id ?? 'create' : 'closed'}
        isOpen={modalOpen}
        onClose={closeModal}
        athleteId={athleteId}
        note={noteToEdit}
        onSaved={onNotesChanged}
      />
    </>
  )
}
