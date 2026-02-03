import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'

export default async function MyCalendarPage() {
  await getCurrentUserWithProfile()
  redirect('/dashboard')
}
