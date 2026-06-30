import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { ProfileForm } from './ProfileForm'

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useActionState: <S,>(_action: unknown, initialState: S) => [initialState, vi.fn()] as const,
  }
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('next-intl', () => ({
  useLocale: () => 'fr',
  useTranslations: (ns: string) => (key: string) => {
    const map: Record<string, Record<string, string>> = {
      profile: {
        coachedSports: 'Sports coachés',
        practicedSports: 'Sports pratiqués',
        spokenLanguages: 'Langues parlées',
        presentation: 'Présentation',
        presentationSubtitle: 'Sous-titre présentation',
        postalCode: 'Code postal',
        postalCodePlaceholder: '75001',
        profilePhoto: 'Photo de profil',
        unsavedChangesAlert: 'Modifications non enregistrées',
        deleteAccount: 'Supprimer le compte',
        save: 'Enregistrer',
        saving: 'Enregistrement…',
        saved: 'Enregistré',
        firstName: 'Prénom',
        lastName: 'Nom',
        email: 'E-mail',
        preferredLocale: 'Langue',
        weeklyVolumesSectionTitle: 'Volumes hebdomadaires',
        noPracticedSportsMessage: 'Aucun sport pratiqué',
        weeklyCurrentHoursLabel: 'Volume actuel',
        weeklyTargetHoursLabel: 'Volume maximum',
        suffixHoursPerWeek: 'h/sem.',
        suffixDPlusPerWeek: 'D+/sem.',
        workoutPrimaryMetricSectionTitle: 'Métrique principale',
        workoutPrimaryMetricSectionSubtitle: 'Sous-titre métrique',
        workoutPrimaryMetricTime: 'Temps',
        workoutPrimaryMetricDistance: 'Distance',
      },
      sports: {
        course: 'Course',
        trail: 'Trail',
        velo: 'Vélo',
        natation: 'Natation',
        musculation: 'Musculation',
        nordic_ski: 'Ski de fond',
        backcountry_ski: 'Ski de randonnée',
        ice_skating: 'Patinage',
        randonnee: 'Randonnée',
        triathlon: 'Triathlon',
        escalade: 'Escalade',
        meditation: 'Méditation',
        canot: 'Canot',
        surf: 'Surf',
        golf: 'Golf',
        yoga: 'Yoga',
      },
      workouts: {},
      common: {
        close: 'Fermer',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        deleting: 'Suppression…',
      },
    }
    return map[ns]?.[key] ?? `${ns}.${key}`
  },
}))

vi.mock('./actions', () => ({
  updateProfile: vi.fn(async () => ({})),
  checkCanDeleteAccount: vi.fn(async () => ({ data: { canDelete: true } })),
  deleteMyAccount: vi.fn(),
}))

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: vi.fn(),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  }),
}))

vi.mock('@/components/LogoutButton', () => ({
  LogoutButton: () => null,
}))

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => null,
}))

vi.mock('./installations/AthleteFacilitiesSection', () => ({
  AthleteFacilitiesSection: () => null,
}))

function getCoachedSportTileSurface(value: string): HTMLElement {
  const checkbox = getCoachedSportCheckbox(value)
  const surface = checkbox.closest('label')?.querySelector('div.rounded-full')
  if (!(surface instanceof HTMLElement)) {
    throw new Error(`Surface de tuile introuvable pour coached_sports=${value}`)
  }
  return surface
}

function expectTileVisuallySelected(surface: HTMLElement, selected: boolean) {
  if (selected) {
    expect(surface.className).toContain('bg-palette-forest-dark')
  } else {
    expect(surface.className).not.toContain('bg-palette-forest-dark')
    expect(surface.className).toContain('bg-white')
  }
}

function getCoachedSportCheckbox(value: string): HTMLInputElement {
  const input = document.querySelector(`input[type="checkbox"][name="coached_sports"][value="${value}"]`)
  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`Checkbox coached_sports introuvable pour ${value}`)
  }
  return input
}

const coachBaseProps = {
  email: 'coach@test.fr',
  firstName: 'Marie',
  lastName: 'Coach',
  role: 'coach' as const,
  avatarUrl: '',
  coachedSports: ['velo', 'trail'],
  practicedSports: [] as string[],
  languages: ['fr'],
  presentation: '',
  presentationFr: '',
  presentationEn: '',
  postalCode: '75001',
}

describe('ProfileForm — sports coachés (coach)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche les sports initialement sélectionnés avec le style actif', () => {
    render(<ProfileForm {...coachBaseProps} />)

    const section = screen.getByText('Sports coachés').closest('div.mb-5')
    expect(section).toBeTruthy()

    expectTileVisuallySelected(getCoachedSportTileSurface('velo'), true)
    expectTileVisuallySelected(getCoachedSportTileSurface('trail'), true)
    expect(getCoachedSportCheckbox('velo').checked).toBe(true)
  })

  it('repasse visuellement en non sélectionné quand un sport pré-sélectionné est décoché', () => {
    render(<ProfileForm {...coachBaseProps} />)

    expectTileVisuallySelected(getCoachedSportTileSurface('velo'), true)

    fireEvent.click(getCoachedSportCheckbox('velo'))

    expect(getCoachedSportCheckbox('velo').checked).toBe(false)
    expectTileVisuallySelected(getCoachedSportTileSurface('velo'), false)
    expectTileVisuallySelected(getCoachedSportTileSurface('trail'), true)
  })

  it('resélectionne visuellement un sport après décochage', () => {
    render(<ProfileForm {...coachBaseProps} coachedSports={['velo']} />)

    fireEvent.click(getCoachedSportCheckbox('velo'))
    expectTileVisuallySelected(getCoachedSportTileSurface('velo'), false)

    fireEvent.click(getCoachedSportCheckbox('velo'))
    expectTileVisuallySelected(getCoachedSportTileSurface('velo'), true)
    expect(getCoachedSportCheckbox('velo').checked).toBe(true)
  })

  it('laisse les sports non coachés initialement en style inactif', () => {
    render(<ProfileForm {...coachBaseProps} />)

    expectTileVisuallySelected(getCoachedSportTileSurface('course'), false)
    expect(getCoachedSportCheckbox('course').checked).toBe(false)
  })
})
