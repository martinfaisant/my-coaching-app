import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import {
  fetchCoachPlatformBillingHistory,
  type CoachPlatformBillingHistory,
} from '@/lib/stripeCoachPlatformBillingHistory'
import {
  coachPlatformPriceIntervalTranslationKey,
  fetchCoachPlatformSubscriptionCardDetails,
  loadCoachPlatformCatalogForEnv,
  type CoachPlatformCatalogOffer,
} from '@/lib/stripeCoachPlatformCatalog'
import type { CoachPlatformSubscription } from '@/types/database'
import { formatShortDate } from '@/lib/dateUtils'
import { formatMoneyAmount } from '@/lib/formatMoney'
import { CoachPlatformSubscriptionOffers } from '@/components/CoachPlatformSubscriptionOffers'
import { CoachPlatformBillingAddressSection } from '@/components/CoachPlatformBillingAddressSection'
import { CoachPlatformSubscriptionStatusSection } from '@/components/CoachPlatformSubscriptionStatusSection'
import { CoachPlatformUnpaidSubscriptionBanner } from '@/components/CoachPlatformUnpaidSubscriptionBanner'
import { loadCoachBillingAddressForPage } from '@/app/[locale]/dashboard/coach-platform-subscription/coachPlatformBillingAddressActions'
import { FORM_LABEL_CLASSES } from '@/lib/formStyles'
import { computeCoachPlatformTrialRemainingDays } from '@/lib/coachPlatformSubscriptionTrial'
import { resolveCoachPlatformTrialPresentationForCoach } from '@/lib/coachPlatformTrialEligibility'
import {
  isCoachPlatformScheduledEnd,
  isCoachPlatformSubscriptionManaged,
  isCoachPlatformSubscriptionUnpaid,
  resolveCoachPlatformAccessEndIso,
  resolveCoachPlatformBillingPeriod,
  shouldShowCoachPlatformOfferGrid,
} from '@/lib/coachPlatformSubscriptionDisplay'

function invoiceStatusLabel(t: (key: string) => string, status: string | null): string {
  if (!status) return '—'
  switch (status) {
    case 'paid':
      return t('invoiceStatus.paid')
    case 'open':
      return t('invoiceStatus.open')
    case 'draft':
      return t('invoiceStatus.draft')
    case 'void':
      return t('invoiceStatus.void')
    case 'uncollectible':
      return t('invoiceStatus.uncollectible')
    default:
      return status
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'coachMsaSubscription' })
  return { title: t('pageTitle') }
}

export default async function CoachPlatformSubscriptionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const current = await getCurrentUserWithProfile()
  if (current.profile.role !== 'coach') {
    redirect(pathWithLocale(locale, '/dashboard'))
  }

  const t = await getTranslations({ locale, namespace: 'coachMsaSubscription' })
  const tBillAddr = await getTranslations({ locale, namespace: 'coachMsaSubscription.billingAddress' })
  const supabase = await createClient()

  const { data: platformRow } = await supabase
    .from('coach_platform_subscriptions')
    .select('*')
    .eq('coach_id', current.id)
    .maybeSingle()

  const row = (platformRow ?? null) as CoachPlatformSubscription | null
  const rowWithDefaults: CoachPlatformSubscription | null = row
    ? {
        ...row,
        cancel_at_period_end: row.cancel_at_period_end ?? false,
        cancel_at: row.cancel_at ?? null,
      }
    : null

  const [catalogResult, cardDetails, billingResult, billingAddressResult] = await Promise.all([
    loadCoachPlatformCatalogForEnv(),
    fetchCoachPlatformSubscriptionCardDetails(rowWithDefaults?.stripe_subscription_id ?? null),
    fetchCoachPlatformBillingHistory(rowWithDefaults?.stripe_customer_id ?? null),
    loadCoachBillingAddressForPage(rowWithDefaults?.stripe_customer_id ?? null),
  ])

  const unpaid = isCoachPlatformSubscriptionUnpaid(rowWithDefaults)
  const managed = isCoachPlatformSubscriptionManaged(rowWithDefaults)
  const scheduledEnd = isCoachPlatformScheduledEnd(rowWithDefaults)
  const showOffers = shouldShowCoachPlatformOfferGrid(rowWithDefaults)
  const dateLocale = locale === 'en' ? 'en-GB' : 'fr-FR'

  const history: CoachPlatformBillingHistory = billingResult.data ?? {
    invoices: [],
    failedPayments: [],
    refunds: [],
  }
  const historyError = billingResult.error
  const catalogError = catalogResult.error
  const offers: CoachPlatformCatalogOffer[] = catalogResult.offers

  const trialPresentation = await resolveCoachPlatformTrialPresentationForCoach(
    supabase,
    current.id,
    rowWithDefaults
  )
  const subscriptionTrialDays = trialPresentation.subscriptionTrialDays
  const trialEligible = trialPresentation.trialEligible

  const periodEndRaw =
    rowWithDefaults?.status === 'trialing'
      ? (cardDetails?.trialEndIso ??
        rowWithDefaults?.current_period_end ??
        cardDetails?.currentPeriodEndIso ??
        null)
      : (rowWithDefaults?.current_period_end ?? cardDetails?.currentPeriodEndIso ?? null)

  const accessEndRaw = resolveCoachPlatformAccessEndIso(rowWithDefaults, periodEndRaw)
  const periodEndLabel = periodEndRaw != null ? formatShortDate(periodEndRaw, dateLocale) : null
  const accessEndLabel = accessEndRaw != null ? formatShortDate(accessEndRaw, dateLocale) : null

  const planLabel = cardDetails?.planLabel ?? t('planUnknown')

  let priceIntervalSuffix: string | null = null
  if (cardDetails) {
    const intervalKey = coachPlatformPriceIntervalTranslationKey(cardDetails.interval, cardDetails.intervalCount)
    if (intervalKey === 'priceIntervalEveryNMonths' || intervalKey === 'priceIntervalEveryNYears') {
      priceIntervalSuffix = t(intervalKey, { n: cardDetails.intervalCount ?? 1 })
    } else if (intervalKey === 'priceIntervalPerMonth') {
      priceIntervalSuffix = t('priceDisplayedUnitPerMonth')
    } else if (intervalKey === 'priceIntervalPerYear') {
      priceIntervalSuffix = t('priceDisplayedUnitPerYear')
    } else if (intervalKey) {
      priceIntervalSuffix = t(intervalKey)
    }
  }

  const priceLine =
    cardDetails?.unitAmountMajor != null
      ? formatMoneyAmount(locale, cardDetails.unitAmountMajor, cardDetails.currency)
      : null

  const billingPeriod = resolveCoachPlatformBillingPeriod(
    cardDetails?.interval ?? null,
    cardDetails?.intervalCount ?? null
  )

  let trialRemainingMessage: string | null = null
  if (rowWithDefaults?.status === 'trialing' && periodEndRaw) {
    const days = computeCoachPlatformTrialRemainingDays(periodEndRaw)
    if (days >= 2) {
      trialRemainingMessage = t('trialRemainingDays', { count: days })
    } else if (days === 1) {
      trialRemainingMessage = t('trialRemainingOneDay')
    } else {
      trialRemainingMessage = t('trialRemainingLastDay')
    }
  }

  const statusForCard =
    rowWithDefaults?.status === 'trialing' ? ('trialing' as const) : ('active' as const)

  const highlightFailedPayments = unpaid

  return (
    <DashboardPageShell>
      <h1 className="text-lg font-bold text-stone-900 mb-4">{t('heading')}</h1>

      {unpaid ? <CoachPlatformUnpaidSubscriptionBanner locale={locale} /> : null}

      {managed && rowWithDefaults && !unpaid ? (
        <section className="mb-8" aria-labelledby="coach-msa-status-heading">
          <h2 id="coach-msa-status-heading" className="sr-only">
            {t('statusSectionTitle')}
          </h2>
          <CoachPlatformSubscriptionStatusSection
            locale={locale}
            planLabel={planLabel}
            status={statusForCard}
            scheduledEnd={scheduledEnd}
            accessEndLabel={accessEndLabel}
            periodEndLabel={periodEndLabel}
            priceLine={priceLine}
            priceIntervalSuffix={priceIntervalSuffix}
            trialRemainingMessage={trialRemainingMessage}
            pricingUnavailable={priceLine == null}
            billingPeriod={billingPeriod}
          />
        </section>
      ) : null}

      {catalogError === 'stripe_unavailable' || catalogError === 'catalog_load_failed' ? (
        <p className="text-sm text-palette-danger mb-6">{t('errors.catalogUnavailable')}</p>
      ) : null}

      {showOffers && offers.length > 0 ? (
        <CoachPlatformSubscriptionOffers
          offers={offers}
          subscriptionTrialDays={subscriptionTrialDays}
          trialEligible={trialEligible}
        />
      ) : null}

      {showOffers && offers.length === 0 && !catalogError ? (
        <p className="text-sm text-stone-500 mb-8">{t('noOffersConfigured')}</p>
      ) : null}

      <section className="space-y-8 mb-8" aria-labelledby="coach-msa-billing-info-heading">
        <h2 id="coach-msa-billing-info-heading" className="text-sm font-bold uppercase tracking-wider text-stone-700">
          {t('billingInfoTitle')}
        </h2>

        <div className="space-y-2">
          <h3 id="coach-billing-address-subheading" className={FORM_LABEL_CLASSES}>
            {tBillAddr('sectionTitle')}
          </h3>
          <CoachPlatformBillingAddressSection
            initialFields={billingAddressResult.fields}
            loadError={billingAddressResult.loadError}
          />
        </div>

        {historyError ? <p className="text-sm text-palette-danger">{t('errors.historyUnavailable')}</p> : null}

        <div>
          <h3 className={FORM_LABEL_CLASSES}>{t('invoicesTitle')}</h3>
          {history.invoices.length === 0 ? (
            <p className="text-sm text-stone-500 py-6 text-center rounded-xl border border-dashed border-stone-200 bg-white">
              {t('invoicesEmpty')}
            </p>
          ) : (
            <div className="rounded-xl border border-stone-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-left text-xs text-stone-600">
                  <tr>
                    <th className="px-3 py-2 font-medium">{t('tableDate')}</th>
                    <th className="px-3 py-2 font-medium">{t('tableLabel')}</th>
                    <th className="px-3 py-2 font-medium text-right">{t('tableAmount')}</th>
                    <th className="px-3 py-2 font-medium">{t('tableStatus')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {history.invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="px-3 py-2.5 text-stone-800 whitespace-nowrap">
                        {formatShortDate(new Date(inv.created * 1000).toISOString(), dateLocale)}
                      </td>
                      <td className="px-3 py-2.5 text-stone-600 min-w-0 max-w-[12rem] truncate" title={inv.label}>
                        {inv.label}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-stone-900 whitespace-nowrap">
                        {formatMoneyAmount(locale, inv.amountPaidMajor, inv.currency)}
                      </td>
                      <td className="px-3 py-2.5 text-xs">
                        {invoiceStatusLabel(t, inv.status)}
                        {inv.invoicePdfUrl ? (
                          <>
                            {' '}
                            <a
                              href={inv.invoicePdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-palette-olive underline"
                            >
                              {t('invoicePdfLink')}
                            </a>
                          </>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h3 className={FORM_LABEL_CLASSES}>{t('failedPaymentsTitle')}</h3>
          {history.failedPayments.length === 0 ? (
            <p className="text-sm text-stone-500 py-6 text-center rounded-xl border border-dashed border-stone-200 bg-white">
              {t('failedPaymentsEmpty')}
            </p>
          ) : (
            <div
              className={`rounded-xl border divide-y divide-stone-100 ${
                highlightFailedPayments
                  ? 'border-2 border-palette-danger/20'
                  : 'border-stone-200'
              }`}
            >
              {history.failedPayments.map((fp) => (
                <div
                  key={fp.id}
                  className={`px-3 py-3 flex flex-wrap justify-between gap-2 text-sm ${
                    highlightFailedPayments ? 'bg-palette-danger-light/50' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-stone-900 font-medium">
                      {formatShortDate(new Date(fp.created * 1000).toISOString(), dateLocale)}
                    </p>
                    {fp.failureMessage ? (
                      <p className="text-xs text-stone-500 mt-0.5 break-words">{fp.failureMessage}</p>
                    ) : null}
                  </div>
                  <p className="text-stone-800 font-medium whitespace-nowrap">
                    {formatMoneyAmount(locale, fp.amountMajor, fp.currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className={FORM_LABEL_CLASSES}>{t('refundsTitle')}</h3>
          {history.refunds.length === 0 ? (
            <p className="text-sm text-stone-500 py-6 text-center rounded-xl border border-dashed border-stone-200 bg-white">
              {t('refundsEmpty')}
            </p>
          ) : (
            <div className="rounded-xl border border-stone-200 divide-y divide-stone-100">
              {history.refunds.map((rf) => (
                <div key={rf.id} className="px-3 py-3 flex flex-wrap justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="text-stone-900 font-medium">
                      {formatShortDate(new Date(rf.created * 1000).toISOString(), dateLocale)}
                    </p>
                    {rf.description ? (
                      <p className="text-xs text-stone-500 mt-0.5 break-words">{rf.description}</p>
                    ) : null}
                    {rf.status ? (
                      <p className="text-xs text-stone-500 mt-0.5">{t('refundStatus', { status: rf.status })}</p>
                    ) : null}
                  </div>
                  <p className="text-stone-800 font-medium whitespace-nowrap">
                    {formatMoneyAmount(locale, -Math.abs(rf.amountMajor), rf.currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </DashboardPageShell>
  )
}
