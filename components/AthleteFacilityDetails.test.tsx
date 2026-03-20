import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'

import { AthleteFacilityDetails } from '@/components/AthleteFacilityDetails'
import { getDefaultFacilityWeekOpening } from '@/lib/facilityHoursUtils'
import type { AthleteFacility } from '@/types/database'

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => {
    const map: Record<string, Record<string, string>> = {
      'facilities.days': {
        monday: 'Lundi',
        tuesday: 'Mardi',
        wednesday: 'Mercredi',
        thursday: 'Jeudi',
        friday: 'Vendredi',
        saturday: 'Samedi',
        sunday: 'Dimanche',
      },
      'facilities.facilityTypes': {
        piscine: 'Piscine',
        salle: 'Salle de sport',
        stade: 'Stade d’athlétisme',
        autre: 'Autre',
      },
      'facilities.hours': {
        open: 'Ouvert',
        closed: 'Fermé',
        dayHoursSeparator: ' : ',
      },
      sports: {
        course: 'Course',
        natation: 'Natation',
        musculation: 'Musculation',
      },
    }
    return map[ns]?.[key] ?? `${ns}.${key}`
  },
}))

function makeFacility(
  overrides: Partial<AthleteFacility> & Pick<AthleteFacility, 'facility_name' | 'facility_type'>
): AthleteFacility {
  const opening_hours = overrides.opening_hours ?? getDefaultFacilityWeekOpening()
  return {
    id: overrides.id ?? 'id-facility',
    athlete_id: overrides.athlete_id ?? 'athlete-id',
    facility_name: overrides.facility_name,
    facility_type: overrides.facility_type,
    address: overrides.address ?? '1 rue du Test',
    address_postal_code: overrides.address_postal_code ?? '75001',
    address_city: overrides.address_city ?? 'Paris',
    address_country: overrides.address_country ?? 'France',
    address_complement: overrides.address_complement ?? null,
    opening_hours,
    created_at: overrides.created_at ?? '',
    updated_at: overrides.updated_at ?? '',
  }
}

describe('AthleteFacilityDetails', () => {
  it('affiche nom, adresse et type de centre', () => {
    const facility = makeFacility({
      facility_name: 'Centre Aquatique',
      facility_type: 'piscine',
      address: '10 avenue Piscine',
    })
    render(<AthleteFacilityDetails facility={facility} />)

    expect(screen.getByText('Centre Aquatique')).toBeTruthy()
    expect(screen.getByText('10 avenue Piscine')).toBeTruthy()
    expect(screen.getByText('Piscine')).toBeTruthy()
  })

  it('affiche les 7 jours et Fermé quand toute la semaine est fermée', () => {
    const facility = makeFacility({
      facility_name: 'Test',
      facility_type: 'salle',
    })
    render(<AthleteFacilityDetails facility={facility} />)

    const schedule = screen.getByTestId('facility-opening-schedule')

    const jours = [
      'Lundi',
      'Mardi',
      'Mercredi',
      'Jeudi',
      'Vendredi',
      'Samedi',
      'Dimanche',
    ]
    for (const j of jours) {
      expect(within(schedule).getByText(j, { exact: true })).toBeTruthy()
    }
    expect(within(schedule).getAllByText('Fermé', { exact: true })).toHaveLength(7)
  })

  it('jour ouvert : badge Ouvert avec séparateur et plages à l’intérieur du pill', () => {
    const opening_hours = getDefaultFacilityWeekOpening()
    opening_hours.monday = {
      open: true,
      slots: [{ start: '09:00', end: '12:00' }],
    }
    const facility = makeFacility({
      facility_name: 'Stade',
      facility_type: 'stade',
      opening_hours,
    })
    render(<AthleteFacilityDetails facility={facility} />)

    const schedule = screen.getByTestId('facility-opening-schedule')

    expect(within(schedule).getByText('Ouvert', { exact: true })).toBeTruthy()
    expect(within(schedule).getByText(/09:00\s*-\s*12:00/)).toBeTruthy()
    expect(within(schedule).getAllByText('Fermé', { exact: true })).toHaveLength(6)
  })

  it('plusieurs plages le même jour : les deux créneaux sont visibles', () => {
    const opening_hours = getDefaultFacilityWeekOpening()
    opening_hours.tuesday = {
      open: true,
      slots: [
        { start: '07:00', end: '09:00' },
        { start: '14:00', end: '18:00' },
      ],
    }
    const facility = makeFacility({
      facility_name: 'Salle',
      facility_type: 'salle',
      opening_hours,
    })
    render(<AthleteFacilityDetails facility={facility} />)

    const schedule = screen.getByTestId('facility-opening-schedule')
    expect(schedule.textContent).toMatch(/07:00\s*-\s*09:00/)
    expect(schedule.textContent).toMatch(/14:00\s*-\s*18:00/)
  })

  it('rend headerRight et footer lorsqu’ils sont fournis', () => {
    const facility = makeFacility({ facility_name: 'X', facility_type: 'autre' })
    render(
      <AthleteFacilityDetails
        facility={facility}
        headerRight={<button type="button">Modifier</button>}
        footer={<p>Erreur suppression</p>}
      />
    )

    expect(screen.getByRole('button', { name: 'Modifier' })).toBeTruthy()
    expect(screen.getByText('Erreur suppression')).toBeTruthy()
  })
})
