import { getTranslations } from 'next-intl/server'
import { formatShortDate } from '@/lib/dateUtils'
import { loadCoachingRequestCoachEmailTemplate, renderEmailTemplate } from '@/lib/emailTemplate'
import { formatCoachRequestSportsLabel } from '@/lib/formatCoachRequestSportsLabel'
import { getSiteUrl } from '@/lib/siteUrl'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { sendResendEmail } from '@/lib/resendClient'
import { truncate } from '@/lib/stringUtils'
import { logger } from '@/lib/logger'
import type { FrozenTitleRow } from '@/lib/frozenOfferI18n'
import { getFrozenTitleForLocale } from '@/lib/frozenOfferI18n'

export type CoachRequestNotificationEmailInput = {
  coachEmail: string
  coachFirstName: string | null
  coachPreferredLocale: string | null
  athleteDisplayName: string
  sportPracticed: string
  coachingNeed: string
  frozenOffer: FrozenTitleRow
  requestDate?: Date
}

function resolveCoachLocale(preferredLocale: string | null | undefined): 'fr' | 'en' {
  return preferredLocale === 'en' ? 'en' : 'fr'
}

export function escapeHtmlForEmail(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function buildCoachRequestNotificationEmailHtml(
  input: CoachRequestNotificationEmailInput,
): Promise<{ html: string; subject: string; locale: 'fr' | 'en' }> {
  const locale = resolveCoachLocale(input.coachPreferredLocale)
  const t = await getTranslations({ locale, namespace: 'coachNotifications.email' })
  const tSports = await getTranslations({ locale, namespace: 'sports' })

  const siteUrl = getSiteUrl()
  const localePath = locale === 'fr' ? 'fr' : 'en'
  const athletesPageUrl = `${siteUrl}${pathWithLocale(locale, '/dashboard/athletes')}`
  const notificationsPageUrl = `${siteUrl}${pathWithLocale(locale, '/dashboard/notifications')}`
  const homeUrl = `${siteUrl}${pathWithLocale(locale, '/')}`
  const loginUrl = `${siteUrl}${pathWithLocale(locale, '/login')}`

  const coachFirstName = (input.coachFirstName ?? '').trim()
  const athleteName = escapeHtmlForEmail(input.athleteDisplayName)
  const greeting = coachFirstName
    ? t('greetingWithName', { coachFirstName })
    : t('greetingWithoutName')
  const introHtml = `${escapeHtmlForEmail(greeting)}<br /><strong>${athleteName}</strong> ${escapeHtmlForEmail(t('introSuffix'))}`

  const offerTitle =
    getFrozenTitleForLocale(input.frozenOffer, locale) ?? t('noOffer')

  const sportsValue = formatCoachRequestSportsLabel(input.sportPracticed, (key) => tSports(key))

  const requestDate = input.requestDate ?? new Date()
  const dateLocale = locale === 'en' ? 'en-US' : 'fr-FR'
  const requestDateLabel = formatShortDate(requestDate, dateLocale)

  const excerpt = truncate((input.coachingNeed ?? '').trim(), 200)
  const messageExcerptBlock = excerpt
    ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: #78716c; border-top: 1px solid #e7e5e4; padding-top: 12px;">« ${escapeHtmlForEmail(excerpt)} »</p>`
    : ''

  const notificationsLinkLabel = escapeHtmlForEmail(t('notificationsLink'))
  const footerNotificationsHtml = `${escapeHtmlForEmail(t('footerNotificationsPrefix'))} <a href="${notificationsPageUrl}" style="color: #506648; text-decoration: none;">${notificationsLinkLabel}</a>${escapeHtmlForEmail(t('footerNotificationsSuffix'))}`

  const template = loadCoachingRequestCoachEmailTemplate()
  const html = renderEmailTemplate(template, {
    locale: localePath,
    pageTitle: t('pageTitle'),
    siteUrl,
    tagline: t('tagline'),
    heading: t('heading'),
    introHtml,
    offerLabel: t('offerLabel'),
    offerTitle: escapeHtmlForEmail(offerTitle),
    sportsLabel: t('sportsLabel'),
    sportsValue: escapeHtmlForEmail(sportsValue),
    dateLabel: t('dateLabel'),
    requestDateLabel: escapeHtmlForEmail(requestDateLabel),
    messageExcerptBlock,
    athletesPageUrl,
    ctaLabel: t('ctaLabel'),
    homeUrl,
    loginUrl,
    homeLinkLabel: t('homeLink'),
    loginLinkLabel: t('loginLink'),
    footerNotificationsHtml,
    copyrightLine: t('copyright'),
  })

  const subject = t('subject', { athleteName: input.athleteDisplayName })

  return { html, subject, locale }
}

/**
 * Envoie l’e-mail de nouvelle demande au coach. Ne pas appeler si la pref est désactivée.
 * @returns true si envoyé, false si skip (pas de clé / pas d’e-mail) — throw uniquement sur erreur Resend après tentative.
 */
export async function sendCoachRequestNotificationEmail(
  input: CoachRequestNotificationEmailInput,
): Promise<boolean> {
  const email = input.coachEmail.trim()
  if (!email) {
    logger.warn('Coach request notification email skipped: coach email missing')
    return false
  }

  try {
    const { html, subject } = await buildCoachRequestNotificationEmailHtml(input)
    const textOffer =
      getFrozenTitleForLocale(input.frozenOffer, resolveCoachLocale(input.coachPreferredLocale)) ??
      '—'

    const text = [
      subject,
      '',
      `${input.athleteDisplayName}`,
      textOffer,
      truncate(input.coachingNeed.trim(), 200),
    ].join('\n')

    await sendResendEmail({
      to: [email],
      subject,
      html,
      text,
    })
    return true
  } catch (err) {
    logger.error('Coach request notification email failed', err)
    return false
  }
}
