'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/Button'
import type { AthleteFacility } from '@/types/database'
import { AthleteFacilityCard } from './AthleteFacilityCard'
import { AthleteFacilityModal } from './AthleteFacilityModal'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { deleteAthleteFacility } from './actions'

export type AthleteFacilitiesSectionProps = {
  initialFacilities: AthleteFacility[]
}

export function AthleteFacilitiesSection({ initialFacilities }: AthleteFacilitiesSectionProps) {
  const t = useTranslations('facilities')
  const router = useRouter()

  const [facilities, setFacilities] = useState<AthleteFacility[]>(initialFacilities)
  const [modalOpen, setModalOpen] = useState(false)
  const [facilityToEdit, setFacilityToEdit] = useState<AthleteFacility | null>(null)

  const [deleteErrorById, setDeleteErrorById] = useState<Record<string, string>>({})
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    setFacilities(initialFacilities)
  }, [initialFacilities])

  const openCreateModal = () => {
    setFacilityToEdit(null)
    setModalOpen(true)
  }

  const openEditModal = (facility: AthleteFacility) => {
    setFacilityToEdit(facility)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  const onSaved = () => {
    setModalOpen(false)
    router.refresh()
  }

  const handleDelete = async (facilityId: string) => {
    if (deleteLoading) return

    const ok = window.confirm(t('deleteConfirmation'))
    if (!ok) return

    setDeleteLoading(true)
    setDeleteErrorById((prev) => {
      const next = { ...prev }
      delete next[facilityId]
      return next
    })

    const res = await deleteAthleteFacility(facilityId)
    if (res.error) {
      setDeleteErrorById((prev) => ({ ...prev, [facilityId]: res.error ?? 'Erreur' }))
      setDeleteLoading(false)
      return
    }

    setDeleteLoading(false)
    router.refresh()
  }

  const sortedFacilities = useMemo(() => {
    return [...facilities].sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''))
  }, [facilities])

  return (
    <section className="mb-0">
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700">{t('sectionTitle')}</h2>
          <p className="mt-2 text-sm text-stone-600">{t('sectionSubtitle')}</p>
        </div>
        <Button type="button" variant="secondary" onClick={openCreateModal} disabled={deleteLoading}>
          {t('addButton')}
        </Button>
      </div>

      {sortedFacilities.length > 0 ? (
        <div className="mt-4 space-y-4">
          {sortedFacilities.map((facility) => (
            <AthleteFacilityCard
              key={facility.id}
              facility={facility}
              onEdit={() => openEditModal(facility)}
              onDelete={() => handleDelete(facility.id)}
              deleteError={deleteErrorById[facility.id] ?? null}
            />
          ))}
        </div>
      ) : null}

      <AthleteFacilityModal
        key={modalOpen ? facilityToEdit?.id ?? 'new' : 'closed'}
        isOpen={modalOpen}
        facility={facilityToEdit}
        onClose={closeModal}
        onSaved={onSaved}
      />
    </section>
  )
}

