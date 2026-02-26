import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/utils/supabase/server'
import { AuthButtons } from '@/components/AuthButtons'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { HomeEmailConfirmedTrigger } from '@/components/HomeEmailConfirmedTrigger'
import {
  Calendar,
  MessageCircle,
  Target,
  TrendingUp,
  Users,
  Award,
  CheckCircle2,
  Activity,
} from 'lucide-react'

type HomePageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ emailConfirmed?: string }>
}

export default async function Home({ params, searchParams }: HomePageProps) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams
  const emailConfirmed = resolvedSearchParams?.emailConfirmed === '1'

  if (emailConfirmed) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const dashboardPath =
        locale === 'en' ? '/en/dashboard' : '/dashboard'
      redirect(dashboardPath)
    }
  }

  const t = await getTranslations('landing')
  
  const FEATURES = [
    {
      icon: Calendar,
      titleKey: 'features.personalizedPlanning.title',
      descriptionKey: 'features.personalizedPlanning.description',
    },
    {
      icon: Activity,
      titleKey: 'features.stravaConnection.title',
      descriptionKey: 'features.stravaConnection.description',
    },
    {
      icon: MessageCircle,
      titleKey: 'features.directMessaging.title',
      descriptionKey: 'features.directMessaging.description',
    },
    {
      icon: Target,
      titleKey: 'features.goalsManagement.title',
      descriptionKey: 'features.goalsManagement.description',
    },
    {
      icon: TrendingUp,
      titleKey: 'features.progressTracking.title',
      descriptionKey: 'features.progressTracking.description',
    },
    {
      icon: Award,
      titleKey: 'features.certifiedCoaches.title',
      descriptionKey: 'features.certifiedCoaches.description',
    },
  ] as const

  const HOW_IT_WORKS = [
    {
      step: '1',
      titleKey: 'howItWorks.step1.title',
      descriptionKey: 'howItWorks.step1.description',
    },
    {
      step: '2',
      titleKey: 'howItWorks.step2.title',
      descriptionKey: 'howItWorks.step2.description',
    },
    {
      step: '3',
      titleKey: 'howItWorks.step3.title',
      descriptionKey: 'howItWorks.step3.description',
    },
  ] as const

  const STATS = [
    { value: '500+', labelKey: 'stats.athletes' },
    { value: '50+', labelKey: 'stats.coaches' },
    { value: '10k+', labelKey: 'stats.workouts' },
    { value: '4.8/5', labelKey: 'stats.satisfaction' },
  ] as const
  
  const COACH_FEATURES = [
    'forCoaches.features.manageAthletes',
    'forCoaches.features.createPlans',
    'forCoaches.features.trackProgress',
    'forCoaches.features.manageOffers',
    'forCoaches.features.communicate',
    'forCoaches.features.receiveReviews',
  ] as const
  return (
    <div className="min-h-screen bg-background">
      <HomeEmailConfirmedTrigger showEmailConfirmedModal={emailConfirmed} />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-xl font-semibold text-stone-900 tracking-tight flex items-center gap-2"
          >
            <Image src="/logo.svg" alt="My Sport Ally" width={80} height={80} className="h-9 w-auto object-contain" />
            <span className="hidden sm:inline">My Sport Ally</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="h-6 w-px bg-stone-200" aria-hidden />
            <AuthButtons />
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-palette-forest-light/10 to-background py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-palette-forest-light/20 border border-palette-forest-light/30 mb-6">
                <span className="w-2 h-2 bg-palette-forest-dark rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-palette-forest-dark">
                  {t('hero.badge')}
                </span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-900 mb-6">
                {t('hero.title')}{' '}
                <span className="text-palette-forest-dark">{t('hero.titleHighlight')}</span>
              </h1>
              
              <p className="text-xl leading-relaxed text-stone-600 mb-10 max-w-2xl mx-auto">
                {t('hero.subtitle')}
              </p>

              <div className="flex justify-center mb-16">
                <AuthButtons variant="hero" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-stone-200">
                {STATS.map(({ value, labelKey }) => (
                  <div key={labelKey} className="text-center">
                    <div className="text-3xl font-bold text-palette-forest-dark mb-1">{value}</div>
                    <div className="text-sm text-stone-600">{t(labelKey)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Screenshot Preview */}
        <section className="py-20 bg-stone-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
                {t('preview.title')}
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                {t('preview.subtitle')}
              </p>
            </div>

            {/* Main Dashboard Preview */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-200 bg-white">
              <div className="aspect-[16/10] relative">
                <Image
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80"
                  alt={t('preview.dashboardAlt')}
                  fill
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 to-transparent"></div>
              </div>
            </div>

            {/* Feature Screenshots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="relative rounded-xl overflow-hidden shadow-lg border border-stone-200 bg-white group">
                <div className="aspect-[4/3] relative">
                  <Image
                    src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80"
                    alt={t('preview.calendarAlt')}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Calendar className="w-8 h-8 text-white mb-2" />
                    <h3 className="text-lg font-semibold text-white">{t('preview.weeklyPlanning')}</h3>
                  </div>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden shadow-lg border border-stone-200 bg-white group">
                <div className="aspect-[4/3] relative">
                  <Image
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
                    alt={t('preview.stravaAlt')}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Activity className="w-8 h-8 text-white mb-2" />
                    <h3 className="text-lg font-semibold text-white">{t('preview.stravaSync')}</h3>
                  </div>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden shadow-lg border border-stone-200 bg-white group">
                <div className="aspect-[4/3] relative">
                  <Image
                    src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&q=80"
                    alt={t('preview.chatAlt')}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <MessageCircle className="w-8 h-8 text-white mb-2" />
                    <h3 className="text-lg font-semibold text-white">{t('preview.liveChat')}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
                {t('features.title')}
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                {t('features.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES.map(({ icon: Icon, titleKey, descriptionKey }) => (
                <div
                  key={titleKey}
                  className="relative group p-8 rounded-2xl border border-stone-200 bg-white hover:shadow-lg transition-all duration-300 hover:border-palette-forest-light"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-palette-forest-light/20 flex items-center justify-center group-hover:bg-palette-forest-light/30 transition-colors">
                      <Icon className="w-6 h-6 text-palette-forest-dark" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-stone-900 mb-2">
                        {t(titleKey)}
                      </h3>
                      <p className="text-sm leading-relaxed text-stone-600">
                        {t(descriptionKey)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 bg-stone-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
                {t('howItWorks.title')}
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                {t('howItWorks.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-24 left-[16.666%] right-[16.666%] h-0.5 bg-gradient-to-r from-palette-forest-light via-palette-forest-default to-palette-forest-light"></div>

              {HOW_IT_WORKS.map(({ step, titleKey, descriptionKey }) => (
                <div key={step} className="relative text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-palette-forest-dark text-white text-2xl font-bold mb-6 shadow-lg relative z-10">
                    {step}
                  </div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">
                    {t(titleKey)}
                  </h3>
                  <p className="text-stone-600 leading-relaxed">
                    {t(descriptionKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Coaches */}
        <section className="py-20 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-200">
                <div className="aspect-[4/3] relative">
                <Image
                  src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80"
                  alt={t('forCoaches.coachAlt')}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-palette-olive-light/20 border border-palette-olive-light/30 mb-6">
                  <Users className="w-4 h-4 text-palette-olive-dark" />
                  <span className="text-sm font-medium text-palette-olive-dark">
                    {t('forCoaches.badge')}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-6">
                  {t('forCoaches.title')}
                </h2>

                <div className="space-y-4 mb-8">
                  {COACH_FEATURES.map((featureKey) => (
                    <div key={featureKey} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-palette-forest-dark flex-shrink-0 mt-0.5" />
                      <span className="text-stone-700">{t(featureKey)}</span>
                    </div>
                  ))}
                </div>

                <AuthButtons variant="hero" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-gradient-to-br from-palette-forest-dark to-palette-forest-default text-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <AuthButtons variant="hero" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-stone-600">
            <p className="text-sm">
              © {new Date().getFullYear()} My Sport Ally. {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
