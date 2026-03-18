'use client'

import { createPortal } from 'react-dom'
import { DatePickerPopup } from '@/components/DatePickerPopup'

type Props = {
  isOpen: boolean
  anchor: DOMRect | null
  value: string
  onChange: (dateStr: string) => void
  onClose: () => void
  locale: string
  minDate?: string
  monthDropdownId: string
}

export function DatePickerPopover({
  isOpen,
  anchor,
  value,
  onChange,
  onClose,
  locale,
  minDate,
  monthDropdownId,
}: Props) {
  if (!isOpen || !anchor || typeof document === 'undefined') return null

  return createPortal(
    <>
      <div className="fixed inset-0 z-[105]" aria-hidden onClick={onClose} />
      <div
        className="fixed z-[110] shadow-xl"
        style={{
          top: anchor.bottom + 8,
          left: anchor.left,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <DatePickerPopup
          value={value}
          onChange={onChange}
          locale={locale}
          minDate={minDate}
          monthDropdownId={monthDropdownId}
        />
      </div>
    </>,
    document.body
  )
}

