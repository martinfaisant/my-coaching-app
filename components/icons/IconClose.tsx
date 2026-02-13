/**
 * Icône de fermeture (X) réutilisable.
 * Utilisée dans les modals, boutons de fermeture, etc.
 */

type IconCloseProps = {
  className?: string
}

export function IconClose({ className = "w-5 h-5" }: IconCloseProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
