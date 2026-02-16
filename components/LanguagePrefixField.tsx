'use client'

/**
 * Champ input ou textarea avec bandeau langue (EN/FR) à gauche.
 * Aligné sur les autres champs : fond blanc, tour vert au focus (focus-within),
 * texte stone-900, placeholder stone-400. Préfixe vert principal (palette-forest-dark).
 */
const PREFIX_CLASSES =
  'shrink-0 px-2.5 text-[10px] font-bold uppercase tracking-wide text-palette-forest-dark bg-palette-forest-dark/10 border-r border-stone-200'

/** Conteneur commun : bordure, fond blanc, ring vert au focus (comme Input/Textarea) */
const WRAPPER_CLASSES =
  'flex rounded-lg border border-stone-300 bg-white overflow-hidden transition focus-within:ring-2 focus-within:ring-palette-forest-dark focus-within:border-transparent'

/** Zone de saisie : mêmes conventions que FORM_BASE_CLASSES (texte, placeholder) */
const FIELD_BASE =
  'flex-1 min-w-0 py-2.5 pl-2 pr-4 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-0 border-0'

type LanguagePrefixInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  lang: 'EN' | 'FR'
  className?: string
}

type LanguagePrefixTextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
  lang: 'EN' | 'FR'
  className?: string
}

export function LanguagePrefixInput({ lang, className = '', ...props }: LanguagePrefixInputProps) {
  return (
    <div className={WRAPPER_CLASSES}>
      <span className={`${PREFIX_CLASSES} py-2.5 flex items-center`}>{lang}</span>
      <input
        className={`${FIELD_BASE} ${className}`.trim()}
        {...props}
      />
    </div>
  )
}

export function LanguagePrefixTextarea({ lang, className = '', ...props }: LanguagePrefixTextareaProps) {
  return (
    <div className={`${WRAPPER_CLASSES} items-stretch`}>
      <span className={`${PREFIX_CLASSES} min-h-full flex items-center justify-center`}>{lang}</span>
      <textarea
        className={`${FIELD_BASE} pb-2.5 text-sm resize-none min-h-[100px] ${className}`.trim()}
        {...props}
      />
    </div>
  )
}
