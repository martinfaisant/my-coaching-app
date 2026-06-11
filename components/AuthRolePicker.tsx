'use client'

import { useTranslations } from 'next-intl'

export type SignupRole = 'athlete' | 'coach'

type AuthRolePickerProps = {
  name?: string
  value: SignupRole | null
  onChange: (role: SignupRole) => void
  error?: string | null
  idPrefix?: string
}

export function AuthRolePicker({
  name = 'role',
  value,
  onChange,
  error,
  idPrefix = 'role',
}: AuthRolePickerProps) {
  const t = useTranslations('auth')

  const tileClass = (role: SignupRole) => {
    const selected = value === role
    const base =
      'flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 p-4 cursor-pointer transition-all'
    if (selected) {
      return `${base} border-palette-forest-dark bg-stone-50 text-stone-900`
    }
    if (error && value === null) {
      return `${base} border-palette-danger text-stone-600`
    }
    return `${base} border-stone-200 hover:border-stone-300 text-stone-600`
  }

  return (
    <div>
      <span className="block text-sm font-medium text-stone-700 mb-3">{t('signupAs')}</span>
      <div className="grid grid-cols-2 gap-3">
        <label className={tileClass('athlete')}>
          <input
            type="radio"
            name={name}
            value="athlete"
            checked={value === 'athlete'}
            onChange={() => onChange('athlete')}
            className="sr-only"
            id={`${idPrefix}-athlete`}
          />
          <span className="text-base font-semibold">{t('athlete')}</span>
          <span className="text-xs text-center">{t('athleteDesc')}</span>
        </label>
        <label className={tileClass('coach')}>
          <input
            type="radio"
            name={name}
            value="coach"
            checked={value === 'coach'}
            onChange={() => onChange('coach')}
            className="sr-only"
            id={`${idPrefix}-coach`}
          />
          <span className="text-base font-semibold">{t('coach')}</span>
          <span className="text-xs text-center">{t('coachDesc')}</span>
        </label>
      </div>
      {error && (
        <p className="mt-2 text-sm text-palette-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
