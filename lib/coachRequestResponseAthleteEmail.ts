import { getTranslations } from 'next-intl/server'
import { formatShortDate } from '@/lib/dateUtils'
import { escapeHtmlForEmail } from '@/lib/coachRequestNotificationEmail'
import {
  loadCoachingRequestResponseAcceptedAthleteEmailTemplate,
  loadCoachingRequestResponseDeclinedAthleteEmailTemplate,
  renderEmailTemplate,
} from '@/lib/emailTemplate'
import { formatCoachRequestSportsLabel } from '@/lib/formatCoachRequestSportsLabel'
import { getSiteUrl } from '@/lib/siteUrl'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { sendResendEmail } from '@/lib/resendClient'
import { logger } from '@/lib/logger'
import type { FrozenTitleRow } from '@/lib/frozenOfferI18n'
import { getFrozenTitleForLocale } from '@/lib/frozenOfferI18n'

export type CoachRequestResponseOutcome = 'accepted' | 'declined'

export type CoachRequestResponseAthleteEmailInput = {
  outcome: CoachRequestResponseOutcome
  athleteEmail: string
  athleteFirstName: string | null
  athletePreferredLocale: string | null
  coachDisplayName: string
  sportPracticed: string
  frozenOffer: FrozenTitleRow
  respondedAt?: Date
}

function resolveAthleteLocale(preferredLocale: string | null | undefined): 'fr' | 'en' {
  return preferredLocale === 'en' ? 'en' : 'fr'
}

export async function buildCoachRequestResponseAthleteEmailHtml(
  input: CoachRequestResponseAthleteEmailInput,
): Promise<{ html: string; subject: string; locale: 'fr' | 'en' }> {
  const locale = resolveAthleteLocale(input.athletePreferredLocale)
  const t = await getTranslations({ locale, namespace: 'athleteNotifications.email' })
  const tSports = await getTranslations({ locale, namespace: 'sports' })

  const siteUrl = getSiteUrl()
  const localePath = locale === 'fr' ? 'fr' : 'en'
  const notificationsPageUrl = `${siteUrl}${pathWithLocale(locale, '/dashboard/notifications')}`
  const homeUrl = `${siteUrl}${pathWithLocale(locale, '/')}`
  const loginUrl = `${siteUrl}${pathWithLocale(locale, '/login')}`
  const ctaPageUrl =
    input.outcome === 'accepted'
      ? `${siteUrl}${pathWithLocale(locale, '/dashboard/coach')}`
      : `${siteUrl}${pathWithLocale(locale, '/dashboard/find-coach')}`

  const athleteFirstName = (input.athleteFirstName ?? '').trim()
  const coachName = escapeHtmlForEmail(input.coachDisplayName)
  const greeting = athleteFirstName
    ? t('greetingWithName', { athleteFirstName })
    : t('greetingWithoutName')
  const introSuffixKey =
    input.outcome === 'accepted' ? 'acceptedIntroSuffix' : 'declinedIntroSuffix'
  const introHtml = `${escapeHtmlForEmail(greeting)}<br /><strong>${coachName}</strong> ${escapeHtmlForEmail(t(introSuffixKey))}`

  const offerTitle =
    getFrozenTitleForLocale(input.frozenOffer, locale) ?? t('noOffer')

  const responseDate = input.respondedAt ?? new Date()
  const dateLocale = locale === 'en' ? 'en-US' : 'fr-FR'
  const responseDateLabel = formatShortDate(responseDate, dateLocale)

  const notificationsLinkLabel = escapeHtmlForEmail(t('notificationsLink'))
  const footerNotificationsHtml = `${escapeHtmlForEmail(t('footerNotificationsPrefix'))} <a href="${notificationsPageUrl}" style="color: #506648; text-decoration: none;">${notificationsLinkLabel}</a>${escapeHtmlForEmail(t('footerNotificationsSuffix'))}`

  const headingKey = input.outcome === 'accepted' ? 'acceptedHeading' : 'declinedHeading'
  const subjectKey = input.outcome === 'accepted' ? 'acceptedSubject' : 'declinedSubject'
  const ctaKey = input.outcome === 'accepted' ? 'acceptedCtaLabel' : 'declinedCtaLabel'

  const baseVariables = {
    locale: localePath,
    pageTitle: t(headingKey),
    siteUrl,
    tagline: t('tagline'),
    heading: t(headingKey),
    introHtml,
    coachLabel: t('coachLabel'),
    coachName,
    offerLabel: t('offerLabel'),
    offerTitle: escapeHtmlForEmail(offerTitle),
    dateLabel: t('dateLabel'),
    responseDateLabel: escapeHtmlForEmail(responseDateLabel),
    ctaPageUrl,
    ctaLabel: t(ctaKey),
    homeUrl,
    loginUrl,
    homeLinkLabel: t('homeLink'),
    loginLinkLabel: t('loginLink'),
    footerNotificationsHtml,
    copyrightLine: t('copyright'),
  }

  if (input.outcome === 'accepted') {
    const sportsValue = formatCoachRequestSportsLabel(input.sportPracticed, (key) => tSports(key))
    const template = loadCoachingRequestResponseAcceptedAthleteEmailTemplate()
    const html = renderEmailTemplate(template, {
      ...baseVariables,
      sportsLabel: t('sportsLabel'),
      sportsValue: escapeHtmlForEmail(sportsValue),
    })
    const subject = t(subjectKey, { coachName: input.coachDisplayName })
    return { html, subject, locale }
  }

  const encouragementHtml = `<p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #57534e;">${escapeHtmlForEmail(t('declinedEncouragement'))}</p>`
  const template = loadCoachingRequestResponseDeclinedAthleteEmailTemplate()
  const html = renderEmailTemplate(template, {
    ...baseVariables,
    encouragementHtml,
  })
  const subject = t(subjectKey, { coachName: input.coachDisplayName })
  return { html, subject, locale }
}

/**
 * Envoie l'e-mail de réponse coach à l'athlète. Ne pas appeler si la pref est désactivée.
 */
export async function sendCoachRequestResponseAthleteEmail(
  input: CoachRequestResponseAthleteEmailInput,
): Promise<boolean> {
  const email = input.athleteEmail.trim()
  if (!email) {
    logger.warn('Coach request response athlete email skipped: athlete email missing')
    return false
  }

  try {
    const { html, subject } = await buildCoachRequestResponseAthleteEmailHtml(input)
    const text = [subject, '', input.coachDisplayName].join('\n')

    await sendResendEmail({
      to: [email],
      subject,
      html,
      text,
    })
    return true
  } catch (err) {
    logger.error('Coach request response athlete email failed', err, {
      outcome: input.outcome,
    })
    return false
  }
}
