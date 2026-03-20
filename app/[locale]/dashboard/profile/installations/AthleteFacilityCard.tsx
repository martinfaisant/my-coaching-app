'use client'

import { AthleteFacilityDetails } from '@/components/AthleteFacilityDetails'
import { Button } from '@/components/Button'
import type { AthleteFacility } from '@/types/database'
import { useTranslations } from 'next-intl'

type Props = {
  facility: AthleteFacility
  onEdit: (facility: AthleteFacility) => void
  onDelete: (facility: AthleteFacility) => void
  deleteError?: string | null
}

export function AthleteFacilityCard({ facility, onEdit, onDelete, deleteError }: Props) {
  const t = useTranslations('facilities')

  return (
    <AthleteFacilityDetails
      facility={facility}
      headerRight={
        <>
          <Button type="button" variant="secondary" onClick={() => onEdit(facility)}>
            {t('edit')}
          </Button>
          <Button type="button" variant="danger" onClick={() => onDelete(facility)}>
            {t('delete')}
          </Button>
        </>
      }
      footer={deleteError ? <p className="mt-3 text-sm text-palette-danger">{deleteError}</p> : null}
    />
  )
}
