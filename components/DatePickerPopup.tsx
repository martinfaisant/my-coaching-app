'use client'

import { useState, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Dropdown } from '@/components/Dropdown'
import { toDateStr } from '@/lib/dateUtils'

/**
 * Popup calendrier pour la sélection d'une date.
 * Deux Dropdown (Mois, Année), plage années -4 / +4, flèches réduites, style compact.
 * Design archivé : docs/archive/design-date-picker-compact/
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
  /** Id du dropdown année (accessibilité). Défaut : ${monthDropdownId}-year */
  yearDropdownId?: string
  /** Classes additionnelles sur le conteneur */
  className?: string
}

const WEEKDAY_OPTIONS: Intl.DateTimeFormatOptions = { weekday: 'narrow' }
const MONTH_LONG_OPTIONS: Intl.DateTimeFormatOptions = { month: 'long' }

function getMonthKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split('-').map(Number)
  return { year: y, month: m - 1 }
}

/** Retourne le nombre de jours dans le mois (month 0-indexed). */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** YYYY-MM-DD du dernier jour du mois (month 0-indexed). */
function getLastDayOfMonthStr(year: number, month: number): string {
  const d = getDaysInMonth(year, month)
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** Lundi = 0. getDay() : 0 = dimanche, 1 = lundi, ... */
function getMondayFirstOffset(date: Date): number {
  const d = date.getDay()
  return (d + 6) % 7
}

/** Retourne true si [firstStr, lastStr] intersecte [minDate, maxDate]. */
function rangeOverlaps(
  firstStr: string,
  lastStr: string,
  minDate: string | undefined,
  maxDate: string | undefined
): boolean {
  if (!minDate && !maxDate) return true
  if (minDate && lastStr < minDate) return false
  if (maxDate && firstStr > maxDate) return false
  return true
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

const YEAR_RANGE = 4

export function DatePickerPopup({
  value,
  onChange,
  locale,
  minDate,
  maxDate,
  monthDropdownId = 'date-picker-month',
  yearDropdownId,
  className = '',
}: DatePickerPopupProps) {
  const t = useTranslations('calendar')
  const today = new Date()
  const todayStr = toDateStr(today)
  const currentYear = today.getFullYear()
  const resolvedYearDropdownId = yearDropdownId ?? `${monthDropdownId}-year`

  const [viewMonthKey, setViewMonthKey] = useState(() => {
    if (value) {
      const d = value.includes('T') ? new Date(value) : new Date(value + 'T12:00:00')
      if (!isNaN(d.getTime())) return getMonthKey(d)
    }
    return getMonthKey(today)
  })

  const { year: viewYear, month: viewMonth } = parseMonthKey(viewMonthKey)
  const viewMonthValue = String(viewMonth + 1).padStart(2, '0')
  const viewYearValue = String(viewYear)

  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = []
    for (let m = 0; m < 12; m++) {
      const firstDay = `${viewYear}-${String(m + 1).padStart(2, '0')}-01`
      const lastDay = getLastDayOfMonthStr(viewYear, m)
      if (!rangeOverlaps(firstDay, lastDay, minDate, maxDate)) continue
      const label = new Date(viewYear, m, 1).toLocaleDateString(locale, MONTH_LONG_OPTIONS)
      const capitalized = label.charAt(0).toUpperCase() + label.slice(1)
      options.push({ value: String(m + 1).padStart(2, '0'), label: capitalized })
    }
    if (viewMonthValue && !options.some((o) => o.value === viewMonthValue)) {
      const label = new Date(viewYear, viewMonth, 1).toLocaleDateString(locale, MONTH_LONG_OPTIONS)
      options.push({ value: viewMonthValue, label: label.charAt(0).toUpperCase() + label.slice(1) })
      options.sort((a, b) => a.value.localeCompare(b.value))
    }
    return options
  }, [locale, viewYear, viewMonth, viewMonthValue, minDate, maxDate])

  const yearOptions = useMemo(() => {
    const options: { value: string; label: string }[] = []
    const minY = currentYear - YEAR_RANGE
    const maxY = currentYear + YEAR_RANGE
    for (let y = minY; y <= maxY; y++) {
      const firstDay = `${y}-01-01`
      const lastDay = `${y}-12-31`
      if (!rangeOverlaps(firstDay, lastDay, minDate, maxDate)) continue
      options.push({ value: String(y), label: String(y) })
    }
    if (viewYear < minY || viewYear > maxY) {
      const firstDay = `${viewYear}-01-01`
      const lastDay = `${viewYear}-12-31`
      if (rangeOverlaps(firstDay, lastDay, minDate, maxDate) && !options.some((o) => o.value === viewYearValue)) {
        options.push({ value: viewYearValue, label: viewYearValue })
        options.sort((a, b) => Number(a.value) - Number(b.value))
      }
    }
    return options
  }, [currentYear, viewYear, viewYearValue, minDate, maxDate])

  const setMonth = useCallback(
    (monthValue: string) => {
      setViewMonthKey(`${viewYear}-${monthValue}`)
    },
    [viewYear]
  )

  const setYear = useCallback(
    (yearValue: string) => {
      setViewMonthKey(`${yearValue}-${viewMonthValue}`)
    },
    [viewMonthValue]
  )

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

  const handleSelectDate = (dateStr: string) => {
    if (minDate && dateStr < minDate) return
    if (maxDate && dateStr > maxDate) return
    onChange(dateStr)
  }

  return (
    <div
      className={`bg-white rounded-xl border border-stone-200 shadow-xl p-3 w-[min(280px,90vw)] ${className}`.trim()}
      role="dialog"
      aria-label="Choisir une date"
    >
      {/* En-tête : Dropdown Mois + Dropdown Année */}
      <div className="flex items-center gap-2 mb-2">
        <Dropdown
          id={monthDropdownId}
          label=""
          hideLabel
          options={monthOptions}
          value={viewMonthValue}
          onChange={setMonth}
          ariaLabel={t('chooseMonth')}
          minWidth="80px"
          className="flex-1 min-w-0"
          triggerClassName="py-2 px-3 text-xs"
          optionClassName="text-xs py-2 px-3"
        />
        <Dropdown
          id={resolvedYearDropdownId}
          label=""
          hideLabel
          options={yearOptions}
          value={viewYearValue}
          onChange={setYear}
          ariaLabel={t('chooseYear')}
          minWidth="80px"
          className="flex-1 min-w-0"
          triggerClassName="py-2 px-3 text-xs"
          optionClassName="text-xs py-2 px-3"
        />
      </div>

      {/* Jours de la semaine (compacts) */}
      <div className="grid grid-cols-7 gap-0.5 mb-0.5 text-center">
        {weekDays.map((wd, i) => (
          <span key={i} className="text-[11px] font-medium text-stone-500 py-0.5">
            {wd}
          </span>
        ))}
      </div>

      {/* Grille des dates (compacte) */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell) => {
          const disabled = Boolean((minDate && cell.dateStr < minDate) || (maxDate && cell.dateStr > maxDate))
          return (
            <button
              key={cell.dateStr}
              type="button"
              disabled={disabled}
              aria-pressed={cell.isSelected}
              aria-label={cell.dateStr}
              className={`min-w-[2rem] h-8 rounded-lg text-xs transition ${
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
    </div>
  )
}
