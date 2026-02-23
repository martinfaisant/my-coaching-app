/**
 * Icône envoi (avion / send).
 * Utilisée dans le bouton « Demande envoyée » de la tuile coach.
 */

type IconSendProps = {
  className?: string
}

export function IconSend({ className = 'w-4 h-4' }: IconSendProps) {
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
      aria-hidden
    >
      <path d="m22 2-7 20-4-9-9-4L22 2z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}
