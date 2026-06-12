import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { OffersForm } from './OffersForm'
import { makeCoachOffer } from './offersTestUtils'

const saveOffersMock = vi.hoisted(() =>
  vi.fn(async (_prev: unknown, _formData: FormData) => ({ success: 'ok' as const }))
)

vi.mock('./actions', () => ({
  saveOffers: (prev: unknown, formData: FormData) => saveOffersMock(prev, formData),
  archiveOffer: vi.fn(),
  publishOffer: vi.fn(),
}))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useActionState: <S, A>(_action: A, initialState: S) => [initialState, _action] as const,
  }
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('next-intl', () => ({
  useLocale: () => 'fr',
  useTranslations: (ns: string) => (key: string, values?: { number?: number }) => {
    const map: Record<string, Record<string, string>> = {
      offers: {
        title: 'Liste des offres',
        offerNumber: 'Offre {number}',
        recommended: 'Recommandé',
        feature: 'Mettre en avant',
        unfeature: 'Retirer de la mise en avant',
        archive: 'Archiver',
        publish: 'Publier',
        offerTitle: "Titre de l'offre",
        offerTitlePlaceholderEn: 'Monthly',
        offerTitlePlaceholderFr: 'Mensuel',
        descriptionLabel: 'Description',
        descriptionPlaceholderEn: 'Desc EN',
        descriptionPlaceholderFr: 'Desc FR',
        pricing: 'Tarification',
        recurrence: 'Récurrence',
        addOffer: 'Ajouter une offre',
        remainingOffers: 'Encore {count} offre',
        remainingOffers_plural: 'Encore {count} offres',
        archivedOffersSection: 'Offres archivées',
        noArchivedOffers: 'Aucune offre archivée',
        archivedAt: 'Archivée le',
        'status.draft': 'Brouillon',
        'status.archived': 'Archivée',
        unsavedChangesAlert: 'Modifications non enregistrées',
        'publishModal.title': 'Publier',
        'publishModal.message': 'Confirmer',
        'publishModal.confirm': 'Confirmer publication',
        'archiveModal.title': 'Archiver',
        'archiveModal.message': 'Confirmer archivage',
        'archiveModal.confirm': 'Archiver',
        'unsavedChangesModal.title': 'Modifications',
        'unsavedChangesModal.message': 'Message',
        'unsavedChangesModal.leaveWithoutSaving': 'Quitter',
        'unsavedChangesModal.saveAndLeave': 'Enregistrer et quitter',
        'priceTypes.monthly': '/ Mois',
        'priceTypes.oneTime': 'Unique',
        'priceTypes.free': 'Gratuit',
      },
      common: {
        save: 'Enregistrer',
        saving: 'Enregistrement…',
        saved: 'Enregistré',
        notSaved: 'Non enregistré',
        cancel: 'Annuler',
      },
    }
    const template = map[ns]?.[key] ?? `${ns}.${key}`
    if (values?.number != null) {
      return template.replace('{number}', String(values.number))
    }
    return template
  },
}))

vi.mock('@/components/LanguagePrefixField', () => ({
  LanguagePrefixInput: ({
    name,
    defaultValue,
  }: {
    name: string
    defaultValue?: string
  }) => <input name={name} defaultValue={defaultValue} />,
  LanguagePrefixTextarea: ({
    name,
    defaultValue,
  }: {
    name: string
    defaultValue?: string
  }) => <textarea name={name} defaultValue={defaultValue} />,
}))

vi.mock('@/components/Segments', () => ({
  Segments: ({
    name,
    value,
  }: {
    name: string
    value?: string
  }) => <input type="hidden" name={name} value={value ?? ''} readOnly />,
}))

function getFeaturedHiddenInput(index: number): HTMLInputElement {
  const input = document.querySelector(`input[name="offer_${index}_featured"]`)
  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`Champ offer_${index}_featured introuvable`)
  }
  return input
}

describe('OffersForm — offre recommandée', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche l’état recommandé depuis les props au chargement', async () => {
    render(
      <OffersForm
        offers={[
          makeCoachOffer({ id: 'offer-a', display_order: 0, is_featured: true }),
          makeCoachOffer({ id: 'offer-b', display_order: 1, title_fr: 'Offre 2' }),
        ]}
      />
    )

    await waitFor(() => {
      expect(getFeaturedHiddenInput(0).value).toBe('on')
    })
    expect(screen.getByText('Recommandé')).toBeTruthy()
    expect(screen.getByTitle('Retirer de la mise en avant')).toBeTruthy()
    expect(getFeaturedHiddenInput(1).value).toBe('')
  })

  it('active Enregistrer quand on déplace la recommandation vers l’offre 1', async () => {
    render(
      <OffersForm
        offers={[
          makeCoachOffer({ id: 'offer-a', display_order: 0 }),
          makeCoachOffer({
            id: 'offer-b',
            display_order: 1,
            title_fr: 'Offre 2',
            is_featured: true,
          }),
        ]}
      />
    )

    const saveButton = screen.getByRole('button', { name: 'Enregistrer' }) as HTMLButtonElement
    await waitFor(() => {
      expect(saveButton.disabled).toBe(true)
    })

    fireEvent.click(screen.getByTitle('Mettre en avant'))

    await waitFor(() => {
      expect(getFeaturedHiddenInput(0).value).toBe('on')
      expect(saveButton.disabled).toBe(false)
    })
  })

})
