import { redirect } from 'next/navigation'

/** Redirection vers la page Gestion des membres dans le dashboard (même design que les autres pages). */
export default async function AdminMembersRedirect() {
  redirect('/dashboard/admin/members')
}
