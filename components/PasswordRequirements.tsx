'use client'

import { useTranslations } from 'next-intl'
import {
  getPasswordCriteria,
  type PasswordCriterionKey,
} from '@/lib/passwordValidation'

const CRITERION_KEYS: PasswordCriterionKey[] = [
  'minLength',
  'lowercase',
  'uppercase',
  'digit',
  'specialChar',
]

type PasswordRequirementsProps = {
  password: string
  listId: string
  highlightFailures?: boolean
}

export function PasswordRequirements({
  password,
  listId,
  highlightFailures = false,
}: PasswordRequirementsProps) {
  const t = useTranslations('auth.passwordRequirements')
  const criteria = getPasswordCriteria(password)

  return (
    <ul id={listId} className="mt-1.5 space-y-0.5" aria-live="polite">
      {CRITERION_KEYS.map((key) => {
        const met = criteria[key]
        const showFailure = highlightFailures && !met && password.length > 0

        let itemClass = 'flex items-center gap-2 text-xs leading-snug text-stone-500'
        if (met) {
          itemClass = 'flex items-center gap-2 text-xs leading-snug text-palette-forest-dark'
        } else if (showFailure) {
          itemClass = 'flex items-center gap-2 text-xs leading-snug text-palette-danger'
        }

        return (
          <li key={key} className={itemClass}>
            <span className="w-4 shrink-0 text-center" aria-hidden="true">
              {met ? '✓' : '○'}
            </span>
            <span>{t(key)}</span>
          </li>
        )
      })}
    </ul>
  )
}
