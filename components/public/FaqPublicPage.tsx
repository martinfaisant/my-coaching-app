import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { FaqAccordion, type FaqAccordionItem } from '@/components/public/FaqAccordion'
import { FaqCrossAudienceBanner } from '@/components/public/FaqCrossAudienceBanner'
import { FaqFinalCta } from '@/components/public/FaqFinalCta'
import { FaqSportsList } from '@/components/public/FaqSportsList'
import { getSportLabel } from '@/lib/getSportLabel'
import {
  FAQ_ATHLETE_ITEM_KEYS,
  FAQ_COACH_ITEM_KEYS,
  FAQ_PUBLIC_SPORT_COUNT,
  FAQ_SPORTS_ITEM_KEYS,
  buildFaqPageJsonLd,
  getFaqSeoPath,
  type FaqAudience,
  type FaqJsonLdItem,
} from '@/lib/faqPublicConfig'
import { PERSISTED_WORKOUT_SPORT_TYPES } from '@/lib/sportsRegistry'

type FaqPublicPageProps = {
  audience: FaqAudience
  locale: string
}

async function buildSportsJsonLdAnswer(intro: string): Promise<string> {
  const labels = await Promise.all(
    PERSISTED_WORKOUT_SPORT_TYPES.map((sport) => getSportLabel(sport))
  )
  return `${intro} ${labels.join(', ')}.`
}

async function buildAccordionItems(
  audience: FaqAudience,
  t: Awaited<ReturnType<typeof getTranslations>>
): Promise<FaqAccordionItem[]> {
  if (audience === 'athlete') {
    return Promise.all(
      FAQ_ATHLETE_ITEM_KEYS.map(async (key) => {
        const question = t(`items.${key}.question`)
        let content

        if (key === 'availableSports') {
          content = (
            <div className="space-y-3">
              <p>{t('items.availableSports.intro')}</p>
              <FaqSportsList />
            </div>
          )
        } else {
          content = <p>{t(`items.${key}.answer`)}</p>
        }

        return { id: key, question, content }
      })
    )
  }

  return Promise.all(
    FAQ_COACH_ITEM_KEYS.map(async (key) => {
      const question = t(`items.${key}.question`)
      let content

      if (key === 'coachableSports') {
        content = (
          <div className="space-y-3">
            <p>{t('items.coachableSports.intro')}</p>
            <FaqSportsList />
          </div>
        )
      } else if (key === 'payOnSignup') {
        content = (
          <div className="space-y-2">
            <p>{t('items.payOnSignup.answer')}</p>
            <Link
              href="/pricing"
              className="inline-block font-medium text-palette-forest-dark underline underline-offset-4 hover:text-palette-olive"
            >
              {t('items.payOnSignup.pricingLink')}
            </Link>
          </div>
        )
      } else {
        content = <p>{t(`items.${key}.answer`)}</p>
      }

      return { id: key, question, content }
    })
  )
}

async function buildJsonLdItems(
  audience: FaqAudience,
  t: Awaited<ReturnType<typeof getTranslations>>
): Promise<FaqJsonLdItem[]> {
  const keys = audience === 'athlete' ? FAQ_ATHLETE_ITEM_KEYS : FAQ_COACH_ITEM_KEYS

  return Promise.all(
    keys.map(async (key) => {
      const question = t(`items.${key}.question`)

      if (FAQ_SPORTS_ITEM_KEYS.has(key)) {
        const intro = t(`items.${key}.intro`)
        const answer = await buildSportsJsonLdAnswer(intro)
        return { question, answer }
      }

      if (audience === 'coach' && key === 'payOnSignup') {
        const answer = `${t('items.payOnSignup.answer')} ${t('items.payOnSignup.pricingLink')}`
        return { question, answer }
      }

      return {
        question,
        answer: t(`items.${key}.answer`),
      }
    })
  )
}

export async function FaqPublicPage({ audience, locale }: FaqPublicPageProps) {
  const namespace = audience === 'athlete' ? 'faqAthlete' : 'faqCoach'
  const t = await getTranslations(namespace)
  const seoPath = getFaqSeoPath(audience)
  const accordionItems = await buildAccordionItems(audience, t)
  const jsonLdItems = await buildJsonLdItems(audience, t)
  const jsonLd = buildFaqPageJsonLd({ locale, path: seoPath, items: jsonLdItems })

  const quickBannerKeys = ['item1', 'item2', 'item3'] as const

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <main>
        <section className="bg-gradient-to-b from-palette-forest-light/15 to-background py-10 sm:py-14">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">{t('hero.title')}</h1>
            <p className="mx-auto mt-3 max-w-xl text-base text-stone-600">{t('hero.subtitle')}</p>
          </div>
        </section>

        <section className="mx-auto -mt-2 mb-8 max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-palette-forest-light/50 bg-palette-forest-light/10 p-5">
            <ul className="grid gap-3 text-sm text-stone-700 sm:grid-cols-3">
              {quickBannerKeys.map((key) => (
                <li key={key} className="flex gap-2">
                  <span className="font-bold text-palette-forest-dark" aria-hidden>
                    ✓
                  </span>
                  <span>
                    {key === 'item2'
                      ? t(`quickBanner.${key}`, { count: FAQ_PUBLIC_SPORT_COUNT })
                      : t(`quickBanner.${key}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-10 sm:px-6 lg:px-8" aria-labelledby="faq-list-heading">
          <h2 id="faq-list-heading" className="sr-only">
            {t('listAriaLabel')}
          </h2>
          <FaqAccordion items={accordionItems} />
        </section>

        <FaqCrossAudienceBanner audience={audience} />
        <FaqFinalCta audience={audience} locale={locale} />
      </main>
    </>
  )
}
