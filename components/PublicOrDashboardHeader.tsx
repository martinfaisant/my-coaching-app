import { DashboardTopBar } from '@/components/DashboardTopBar'
import { PublicHeader } from '@/components/PublicHeader'
import { getOptionalUserWithProfile } from '@/utils/auth'

/**
 * En-tête marketing : visiteur → PublicHeader ; session active → même barre que le dashboard.
 */
export async function PublicOrDashboardHeader() {
  const current = await getOptionalUserWithProfile()
  if (!current) {
    return <PublicHeader />
  }
  return <DashboardTopBar profile={{ ...current.profile, email: current.email }} />
}
