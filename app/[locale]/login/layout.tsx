import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte My Sport Ally pour accéder à vos entraînements et suivre vos performances."
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
