import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { CoachAthleteNoteModal } from '@/components/CoachAthleteNoteModal'
import type { CoachAthleteNote } from '@/types/database'
import {
  createCoachAthleteNote,
  updateCoachAthleteNote,
  deleteCoachAthleteNote,
} from '@/app/[locale]/dashboard/athletes/[athleteId]/coachNotesActions'

vi.mock('@/app/[locale]/dashboard/athletes/[athleteId]/coachNotesActions', () => ({
  createCoachAthleteNote: vi.fn(),
  updateCoachAthleteNote: vi.fn(),
  deleteCoachAthleteNote: vi.fn(),
}))

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => {
    const map: Record<string, Record<string, string>> = {
      coachAthleteNotes: {
        modalCreateTitle: 'Nouvelle note',
        modalEditTitle: 'Modifier la note',
        fieldTitle: 'Titre',
        fieldBody: 'Note',
        cancel: 'Annuler',
        save: 'Enregistrer',
        saving: 'Enregistrement…',
        deleteNote: 'Supprimer la note',
        deleteConfirm: 'Confirmer suppression ?',
      },
      'coachAthleteNotes.validation': {
        titleRequired: 'Saisissez un titre.',
        bodyRequired: 'Saisissez le texte.',
      },
      common: {
        deleting: 'Suppression…',
        close: 'Fermer',
      },
    }
    return map[ns]?.[key] ?? `${ns}.${key}`
  },
}))

const mockedCreate = vi.mocked(createCoachAthleteNote)
const mockedUpdate = vi.mocked(updateCoachAthleteNote)
const mockedDelete = vi.mocked(deleteCoachAthleteNote)

function makeNote (overrides: Partial<CoachAthleteNote>): CoachAthleteNote {
  return {
    id: 'note-1',
    athlete_id: 'athlete-1',
    coach_id: 'coach-1',
    title: 'Titre initial',
    body: 'Corps initial',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
    ...overrides,
  }
}

describe('CoachAthleteNoteModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  it('en création : affiche le titre de modale et valide titre + corps vides', async () => {
    const onSaved = vi.fn()
    const onClose = vi.fn()

    render(
      <CoachAthleteNoteModal
        isOpen
        onClose={onClose}
        athleteId="athlete-1"
        note={null}
        onSaved={onSaved}
      />
    )

    expect(screen.getByRole('heading', { name: 'Nouvelle note' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))

    await waitFor(() => {
      expect(screen.getByText('Saisissez un titre.')).toBeTruthy()
    })
    expect(mockedCreate).not.toHaveBeenCalled()
  })

  it('en création : envoie createCoachAthleteNote puis onSaved et onClose', async () => {
    mockedCreate.mockResolvedValue({ data: { id: 'new-id' } })

    const onSaved = vi.fn()
    const onClose = vi.fn()

    render(
      <CoachAthleteNoteModal
        isOpen
        onClose={onClose}
        athleteId="athlete-1"
        note={null}
        onSaved={onSaved}
      />
    )

    fireEvent.change(screen.getByLabelText(/Titre/i), { target: { value: 'Mon titre' } })
    fireEvent.change(screen.getByLabelText(/^Note/i), { target: { value: 'Mon corps' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))

    await waitFor(() => {
      expect(mockedCreate).toHaveBeenCalledWith({
        athleteId: 'athlete-1',
        title: 'Mon titre',
        body: 'Mon corps',
      })
    })
    expect(onSaved).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('en édition : appelle updateCoachAthleteNote avec le noteId', async () => {
    mockedUpdate.mockResolvedValue({ data: true })

    const note = makeNote({ id: 'nid-99' })
    const onSaved = vi.fn()
    const onClose = vi.fn()

    render(
      <CoachAthleteNoteModal
        isOpen
        onClose={onClose}
        athleteId="athlete-1"
        note={note}
        onSaved={onSaved}
      />
    )

    expect(screen.getByRole('heading', { name: 'Modifier la note' })).toBeTruthy()

    fireEvent.change(screen.getByLabelText(/Titre/i), { target: { value: 'Titre MAJ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))

    await waitFor(() => {
      expect(mockedUpdate).toHaveBeenCalledWith({
        athleteId: 'athlete-1',
        noteId: 'nid-99',
        title: 'Titre MAJ',
        body: 'Corps initial',
      })
    })
  })

  it('en édition : suppression après confirmation appelle deleteCoachAthleteNote', async () => {
    mockedDelete.mockResolvedValue({ data: true })

    const note = makeNote({ id: 'to-del' })
    const onSaved = vi.fn()
    const onClose = vi.fn()

    render(
      <CoachAthleteNoteModal
        isOpen
        onClose={onClose}
        athleteId="athlete-1"
        note={note}
        onSaved={onSaved}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer la note' }))

    await waitFor(() => {
      expect(mockedDelete).toHaveBeenCalledWith({ athleteId: 'athlete-1', noteId: 'to-del' })
    })
    expect(onSaved).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('n’affiche pas le dialogue quand isOpen est false', () => {
    render(
      <CoachAthleteNoteModal
        isOpen={false}
        onClose={vi.fn()}
        athleteId="athlete-1"
        note={null}
        onSaved={vi.fn()}
      />
    )

    expect(screen.queryByRole('heading', { name: 'Nouvelle note' })).toBeNull()
  })
})
