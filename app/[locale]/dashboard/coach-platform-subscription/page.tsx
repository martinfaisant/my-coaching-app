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
import { CoachPlatformSubscriptionOffers } from '@/components/CoachPlatformSubscriptionOffers'
import { CoachPlatformBillingAddressSection } from '@/components/CoachPlatformBillingAddressSection'
import { loadCoachBillingAddressForPage } from '@/app/[locale]/dashboard/coach-platform-subscription/coachPlatformBillingAddressActions'
import { FORM_LABEL_CLASSES } from '@/lib/formStyles'

function hasManagingPlatformSubscription(row: CoachPlatformSubscription | null): boolean {
  if (!row) return false
  return row.status === 'active' || row.status === 'trialing'
}

function formatMoney(locale: string, amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

function inactiveSubscriptionStatusLabel(t: (key: string) => string, status: string): string {
  switch (status) {
    case 'active':
      return t('subscriptionStatus.active')
    case 'trialing':
      return t('subscriptionStatus.trialing')
    case 'past_due':
      return t('subscriptionStatus.past_due')
    case 'unpaid':
      return t('subscriptionStatus.unpaid')
    case 'canceled':
      return t('subscriptionStatus.canceled')
    case 'incomplete':
      return t('subscriptionStatus.incomplete')
    case 'incomplete_expired':
      return t('subscriptionStatus.incomplete_expired')
    case 'paused':
      return t('subscriptionStatus.paused')
    case 'none':
      return t('subscriptionStatus.none')
    default:
      return status
  }
}

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

  const [catalogResult, cardDetails, billingResult, billingAddressResult] = await Promise.all([
    loadCoachPlatformCatalogForEnv(),
    fetchCoachPlatformSubscriptionCardDetails(row?.stripe_subscription_id ?? null),
    fetchCoachPlatformBillingHistory(row?.stripe_customer_id ?? null),
    loadCoachBillingAddressForPage(row?.stripe_customer_id ?? null),
  ])

  const managing = hasManagingPlatformSubscription(row)
  const dateLocale = locale === 'en' ? 'en-GB' : 'fr-FR'

  const history: CoachPlatformBillingHistory = billingResult.data ?? {
    invoices: [],
    failedPayments: [],
    refunds: [],
  }
  const historyError = billingResult.error
  const catalogError = catalogResult.error
  const offers: CoachPlatformCatalogOffer[] = catalogResult.offers

  const periodEndRaw = row?.current_period_end ?? cardDetails?.currentPeriodEndIso ?? null
  const periodEndLabel = periodEndRaw != null ? formatShortDate(periodEndRaw, dateLocale) : null

  const planLabel = cardDetails?.planLabel ?? null

  let priceIntervalSuffix: string | null = null
  if (cardDetails) {
    const intervalKey = coachPlatformPriceIntervalTranslationKey(cardDetails.interval, cardDetails.intervalCount)
    if (intervalKey === 'priceIntervalEveryNMonths' || intervalKey === 'priceIntervalEveryNYears') {
      priceIntervalSuffix = t(intervalKey, { n: cardDetails.intervalCount ?? 1 })
    } else if (intervalKey) {
      priceIntervalSuffix = t(intervalKey)
    }
  }

  const isFreeTrialDisplay =
    row?.status === 'trialing' &&
    (cardDetails?.unitAmountMajor === 0 || cardDetails?.unitAmountMajor == null)

  return (
    <DashboardPageShell>
      <h1 className="text-lg font-bold text-stone-900 mb-4">{t('heading')}</h1>

      <section className="mb-8" aria-labelledby="coach-msa-status-heading">
        <h2 id="coach-msa-status-heading" className="sr-only">
          {t('statusSectionTitle')}
        </h2>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          {!row ? (
            <>
              <span className="inline-flex rounded-full border border-stone-300 bg-white px-2.5 py-0.5 text-xs font-semibold text-stone-700">
                {t('badgeNoSubscription')}
              </span>
              <p className="text-sm text-stone-600 mt-2">{t('noSubscriptionDescription')}</p>
            </>
          ) : managing ? (
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-stone-900">{planLabel ?? t('planUnknown')}</p>
                {isFreeTrialDisplay ? (
                  <p className="text-sm text-stone-900 font-semibold mt-3">{t('trialFree')}</p>
                ) : cardDetails?.unitAmountMajor != null ? (
                  <p className="text-sm text-stone-900 font-semibold mt-3">
                    {formatMoney(locale, cardDetails.unitAmountMajor, cardDetails.currency)}
                    {priceIntervalSuffix ? (
                      <span className="font-normal text-stone-600"> {priceIntervalSuffix}</span>
                    ) : null}
                  </p>
                ) : (
                  <p className="text-sm text-stone-500 mt-3">{t('cardPricingUnavailable')}</p>
                )}
                {periodEndLabel ? (
                  <p className="text-sm text-stone-600 mt-2">{t('nextPaymentWithDate', { date: periodEndLabel })}</p>
                ) : null}
              </div>
              <div className="shrink-0">
                {row.status === 'trialing' ? (
                  <span className="inline-flex rounded-full bg-palette-forest-dark px-2.5 py-0.5 text-xs font-semibold text-white">
                    {t('subscriptionStatus.trialing')}
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-palette-forest-dark px-2.5 py-0.5 text-xs font-semibold text-white">
                    {t('subscriptionStatus.active')}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <>
              <span className="inline-flex rounded-full border border-stone-300 bg-white px-2.5 py-0.5 text-xs font-semibold text-stone-700">
                {inactiveSubscriptionStatusLabel(t, row.status)}
              </span>
              <p className="text-sm text-stone-600 mt-2">
                {row.status === 'past_due' || row.status === 'unpaid'
                  ? t('paymentDefaultDescription')
                  : row.status === 'none'
                    ? t('stripeCustomerOnlyDescription')
                    : t('inactiveSubscriptionDescription')}
              </p>
            </>
          )}
        </div>
      </section>

      {catalogError === 'stripe_unavailable' || catalogError === 'catalog_load_failed' ? (
        <p className="text-sm text-palette-danger mb-6">{t('errors.catalogUnavailable')}</p>
      ) : null}

      {!managing && offers.length > 0 ? <CoachPlatformSubscriptionOffers offers={offers} /> : null}

      {!managing && offers.length === 0 && !catalogError ? (
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
                        {formatMoney(locale, inv.amountPaidMajor, inv.currency)}
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
            <div className="rounded-xl border border-stone-200 divide-y divide-stone-100">
              {history.failedPayments.map((fp) => (
                <div key={fp.id} className="px-3 py-3 flex flex-wrap justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="text-stone-900 font-medium">
                      {formatShortDate(new Date(fp.created * 1000).toISOString(), dateLocale)}
                    </p>
                    {fp.failureMessage ? (
                      <p className="text-xs text-stone-500 mt-0.5 break-words">{fp.failureMessage}</p>
                    ) : null}
                  </div>
                  <p className="text-stone-800 font-medium whitespace-nowrap">
                    {formatMoney(locale, fp.amountMajor, fp.currency)}
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
                    {rf.status ? <p className="text-xs text-stone-500 mt-0.5">{t('refundStatus', { status: rf.status })}</p> : null}
                  </div>
                  <p className="text-stone-800 font-medium whitespace-nowrap">
                    {formatMoney(locale, -Math.abs(rf.amountMajor), rf.currency)}
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
