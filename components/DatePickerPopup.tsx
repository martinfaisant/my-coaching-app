'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Dropdown } from '@/components/Dropdown'
import { toDateStr } from '@/lib/dateUtils'

/**
 * Popup calendrier pour la sélection d'une date.
 * Conforme au design system : Dropdown pour le mois, grille de jours, date sélectionnée en palette-forest-dark, lien « Aujourd'hui » (pas de bouton Effacer — date obligatoire).
 * Référence : docs/design-workout-modal-calendar/mockup-calendar-popup.html, DESIGN_CALENDAR_POPUP.md
 */

export type DatePickerPopupProps = {
  /** Date sélectionnée (YYYY-MM-DD) */
  value: string
  /** Appelé quand l'utilisateur choisit une date */
  onChange: (dateStr: string) => void
  /** Locale pour les noms de mois et jours (ex. fr-FR, en-US) */
  locale: string
  /** Date minimale sélectionnable (YYYY-MM-DD, optionnel) */
  minDate?: string
  /** Date maximale sélectionnable (YYYY-MM-DD, optionnel) */
  maxDate?: string
  /** Id du dropdown mois (accessibilité) */
  monthDropdownId?: string
  /** Classes additionnelles sur le conteneur */
  className?: string
}

const WEEKDAY_OPTIONS: Intl.DateTimeFormatOptions = { weekday: 'narrow' }
const MONTH_YEAR_OPTIONS: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }

function getMonthKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split('-').map(Number)
  return { year: y, month: m - 1 }
}

/** Retourne le nombre de jours dans le mois (0-indexed). */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** Lundi = 0. getDay() : 0 = dimanche, 1 = lundi, ... */
function getMondayFirstOffset(date: Date): number {
  const d = date.getDay()
  return (d + 6) % 7
}

type CalendarCell = {
  dateStr: string
  day: number
  isCurrentMonth: boolean
  isSelected: boolean
  isToday: boolean
}

function buildCalendarCells(
  viewYear: number,
  viewMonth: number,
  value: string,
  todayStr: string
): CalendarCell[] {
  const first = new Date(viewYear, viewMonth, 1)
  const offset = getMondayFirstOffset(first)
  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const cells: CalendarCell[] = []

  // Celles vides avant le 1er
  for (let i = 0; i < offset; i++) {
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear
    const prevDays = getDaysInMonth(prevYear, prevMonth)
    const day = prevDays - offset + i + 1
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push({
      dateStr,
      day,
      isCurrentMonth: false,
      isSelected: dateStr === value,
      isToday: dateStr === todayStr,
    })
  }

  // Jours du mois courant
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      dateStr,
      day: d,
      isCurrentMonth: true,
      isSelected: dateStr === value,
      isToday: dateStr === todayStr,
    })
  }

  // Compléter jusqu'à 42 cases (6 semaines)
  const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1
  const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear
  let fillDay = 1
  while (cells.length < 42) {
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(fillDay).padStart(2, '0')}`
    cells.push({
      dateStr,
      day: fillDay,
      isCurrentMonth: false,
      isSelected: dateStr === value,
      isToday: dateStr === todayStr,
    })
    fillDay++
  }

  return cells
}

export function DatePickerPopup({
  value,
  onChange,
  locale,
  minDate,
  maxDate,
  monthDropdownId = 'date-picker-month',
  className = '',
}: DatePickerPopupProps) {
  const t = useTranslations('calendar')
  const today = new Date()
  const todayStr = toDateStr(today)

  const [viewMonthKey, setViewMonthKey] = useState(() => {
    if (value) {
      const d = value.includes('T') ? new Date(value) : new Date(value + 'T12:00:00')
      if (!isNaN(d.getTime())) return getMonthKey(d)
    }
    return getMonthKey(today)
  })

  const { year: viewYear, month: viewMonth } = parseMonthKey(viewMonthKey)

  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = []
    const startYear = today.getFullYear()
    const startMonth = today.getMonth()
    const endYear = today.getFullYear() + 2
    const endMonth = today.getMonth()
    let y = startYear
    let m = startMonth
    while (y < endYear || (y === endYear && m <= endMonth)) {
      const key = `${y}-${String(m + 1).padStart(2, '0')}`
      const label = new Date(y, m, 1).toLocaleDateString(locale, MONTH_YEAR_OPTIONS)
      const capitalized = label.charAt(0).toUpperCase() + label.slice(1)
      options.push({ value: key, label: capitalized })
      m += 1
      if (m > 11) {
        m = 0
        y += 1
      }
    }
    if (viewMonthKey && !options.some((o) => o.value === viewMonthKey)) {
      const { year, month } = parseMonthKey(viewMonthKey)
      const label = new Date(year, month, 1).toLocaleDateString(locale, MONTH_YEAR_OPTIONS)
      options.push({ value: viewMonthKey, label: label.charAt(0).toUpperCase() + label.slice(1) })
      options.sort((a, b) => a.value.localeCompare(b.value))
    }
    return options
  }, [locale, today.getFullYear(), today.getMonth(), viewMonthKey])

  const weekDays = useMemo(() => {
    const days: string[] = []
    for (let i = 1; i <= 7; i++) {
      const d = new Date(2024, 0, i)
      days.push(d.toLocaleDateString(locale, WEEKDAY_OPTIONS))
    }
    return days
  }, [locale])

  const cells = useMemo(
    () => buildCalendarCells(viewYear, viewMonth, value, todayStr),
    [viewYear, viewMonth, value, todayStr]
  )

  const goPrevMonth = () => {
    if (viewMonth === 0) setViewMonthKey(`${viewYear - 1}-12`)
    else setViewMonthKey(`${viewYear}-${String(viewMonth).padStart(2, '0')}`)
  }

  const goNextMonth = () => {
    if (viewMonth === 11) setViewMonthKey(`${viewYear + 1}-01`)
    else setViewMonthKey(`${viewYear}-${String(viewMonth + 2).padStart(2, '0')}`)
  }

  const handleSelectDate = (dateStr: string) => {
    if (minDate && dateStr < minDate) return
    if (maxDate && dateStr > maxDate) return
    onChange(dateStr)
  }

  const handleToday = () => {
    const str = toDateStr(new Date())
    if (minDate && str < minDate) return
    if (maxDate && str > maxDate) return
    onChange(str)
  }

  return (
    <div
      className={`bg-white rounded-xl border border-stone-200 shadow-xl p-4 w-[min(320px,90vw)] ${className}`.trim()}
      role="dialog"
      aria-label="Choisir une date"
    >
      {/* En-tête : Dropdown mois (design system) + flèches */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <Dropdown
          id={monthDropdownId}
          label=""
          hideLabel
          options={monthOptions}
          value={viewMonthKey}
          onChange={setViewMonthKey}
          ariaLabel="Choisir le mois"
          minWidth="140px"
          className="min-w-0"
        />
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="p-2 rounded-lg text-stone-500 hover:text-palette-forest-dark hover:bg-stone-100 transition"
            aria-label="Mois précédent"
            onClick={goPrevMonth}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            className="p-2 rounded-lg text-stone-500 hover:text-palette-forest-dark hover:bg-stone-100 transition"
            aria-label="Mois suivant"
            onClick={goNextMonth}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 mb-1 text-center">
        {weekDays.map((wd, i) => (
          <span key={i} className="text-xs font-medium text-stone-500 py-1">
            {wd}
          </span>
        ))}
      </div>

      {/* Grille des dates */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const disabled = Boolean((minDate && cell.dateStr < minDate) || (maxDate && cell.dateStr > maxDate))
          return (
            <button
              key={cell.dateStr}
              type="button"
              disabled={disabled}
              aria-pressed={cell.isSelected}
              aria-label={cell.dateStr}
              className={`min-w-[2.25rem] h-9 rounded-lg text-sm transition ${
                disabled
                  ? 'text-stone-300 cursor-not-allowed'
                  : cell.isSelected
                    ? 'font-medium bg-palette-forest-dark text-white hover:bg-palette-forest-darker'
                    : cell.isCurrentMonth
                      ? 'text-stone-900 hover:bg-stone-100'
                      : 'text-stone-400 hover:bg-stone-100'
              }`}
              onClick={() => !disabled && handleSelectDate(cell.dateStr)}
            >
              {cell.day}
            </button>
          )
        })}
      </div>

      {/* Pied : Aujourd'hui uniquement (pas de Effacer) */}
      <div className="flex justify-end mt-4 pt-3 border-t border-stone-200">
        <button
          type="button"
          className="text-sm font-medium text-palette-forest-dark hover:text-palette-forest-darker hover:underline transition"
          onClick={handleToday}
        >
          {t('today')}
        </button>
      </div>
    </div>
  )
}
