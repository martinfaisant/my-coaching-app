import type { Metadata } from 'next'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/utils/supabase/server'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { ObjectifsTable } from './ObjectifsTable'
import { NextGoalHeader } from './NextGoalHeader'
import type { Goal } from '@/types/database'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('goalsTitle')
  }
}

export default async function ObjectifsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'goals' })
  const current = await getCurrentUserWithProfile()

  if (current.profile.role !== 'athlete') {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('athlete_id', current.id)
    .order('date', { ascending: true })

  const goalsList = (goals ?? []) as Goal[]

  return (
    <DashboardPageShell
      title={t('title')}
      rightContent={<NextGoalHeader goals={goalsList} />}
    >
      <ObjectifsTable goals={goalsList} />
    </DashboardPageShell>
  )
}
