import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { CoachAthleteNotesSection } from '@/components/CoachAthleteNotesSection'
import type { CoachAthleteNote } from '@/types/database'
import { deleteCoachAthleteNote } from '@/app/[locale]/dashboard/athletes/[athleteId]/coachNotesActions'

vi.mock('@/app/[locale]/dashboard/athletes/[athleteId]/coachNotesActions', () => ({
  deleteCoachAthleteNote: vi.fn(),
  createCoachAthleteNote: vi.fn(),
  updateCoachAthleteNote: vi.fn(),
}))

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => {
    const map: Record<string, Record<string, string>> = {
      coachAthleteNotes: {
        newNote: 'Nouvelle note',
        emptyTitle: 'Aucune note pour le moment',
        emptyDescription: 'Seul le coach auteur voit ses notes.',
        edit: 'Modifier',
        delete: 'Supprimer',
        deleteConfirm: 'Supprimer cette note ?',
        modalCreateTitle: 'Nouvelle note',
        modalEditTitle: 'Modifier la note',
        fieldTitle: 'Titre',
        fieldBody: 'Note',
        cancel: 'Annuler',
        save: 'Enregistrer',
        saving: 'Enregistrement…',
        deleteNote: 'Supprimer la note',
      },
      'coachAthleteNotes.validation': {
        titleRequired: 'Saisissez un titre.',
        bodyRequired: 'Saisissez le texte.',
        noteNotFound: 'Note introuvable.',
        serverError: 'Erreur serveur.',
      },
      common: {
        deleting: 'Suppression…',
        close: 'Fermer',
      },
    }
    return map[ns]?.[key] ?? `${ns}.${key}`
  },
}))

const mockedDelete = vi.mocked(deleteCoachAthleteNote)

function makeNote (overrides: Partial<CoachAthleteNote> & Pick<CoachAthleteNote, 'id' | 'title' | 'body'>): CoachAthleteNote {
  return {
    athlete_id: 'athlete-1',
    coach_id: 'coach-1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
    ...overrides,
  }
}

describe('CoachAthleteNotesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  it('affiche le CTA Nouvelle note et l’état vide sans tuiles', () => {
    const onNotesChanged = vi.fn()
    render(
      <CoachAthleteNotesSection athleteId="athlete-1" initialNotes={[]} onNotesChanged={onNotesChanged} />
    )

    expect(screen.getByRole('button', { name: 'Nouvelle note' })).toBeTruthy()
    expect(screen.getByText('Aucune note pour le moment')).toBeTruthy()
    expect(screen.getByText('Seul le coach auteur voit ses notes.')).toBeTruthy()
  })

  it('affiche le titre et le corps de chaque note', () => {
    const notes = [
      makeNote({ id: 'n1', title: 'Genou', body: 'Ligne 1\nLigne 2' }),
      makeNote({ id: 'n2', title: 'VMA', body: 'Contenu court' }),
    ]
    render(
      <CoachAthleteNotesSection athleteId="athlete-1" initialNotes={notes} onNotesChanged={vi.fn()} />
    )

    expect(screen.getByRole('heading', { name: 'Genou' })).toBeTruthy()
    expect(
      screen.getByText((content) => content.includes('Ligne 1') && content.includes('Ligne 2'))
    ).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'VMA' })).toBeTruthy()
  })

  it('appelle deleteCoachAthleteNote puis onNotesChanged après confirmation', async () => {
    mockedDelete.mockResolvedValue({ data: true })

    const onNotesChanged = vi.fn()
    const note = makeNote({ id: 'note-del', title: 'T', body: 'B' })

    render(
      <CoachAthleteNotesSection athleteId="athlete-1" initialNotes={[note]} onNotesChanged={onNotesChanged} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }))

    await waitFor(() => {
      expect(mockedDelete).toHaveBeenCalledWith({ athleteId: 'athlete-1', noteId: 'note-del' })
    })
    expect(onNotesChanged).toHaveBeenCalledTimes(1)
  })

  it('affiche l’erreur serveur sous la tuile si la suppression échoue', async () => {
    mockedDelete.mockResolvedValue({ error: 'Échec réseau', code: 'SERVER_ERROR' })

    const note = makeNote({ id: 'note-err', title: 'T', body: 'B' })

    render(
      <CoachAthleteNotesSection athleteId="athlete-1" initialNotes={[note]} onNotesChanged={vi.fn()} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }))

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toBe('Échec réseau')
    })
  })
})
