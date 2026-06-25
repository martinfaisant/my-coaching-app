import { logger } from '@/lib/logger'
import {
  RESEND_KEY_MISSING_ERROR,
  getResendApiKey,
  sendResendEmail,
} from '@/lib/resendClient'

export { RESEND_KEY_MISSING_ERROR }

const DEFAULT_TO = 'support@mysportally.com'

export type ContactSupportEmailPayload = {
  reference: string
  locale: 'fr' | 'en'
  firstName: string
  lastName: string
  email: string
  phone: string | null
  reasonLabel: string
  reasonKey: string
  message: string
  userId: string | null
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Envoie le message au support via Resend (Reply-To = e-mail du formulaire).
 */
export async function sendContactSupportEmail(payload: ContactSupportEmailPayload): Promise<void> {
  const apiKey = getResendApiKey()
  if (!apiKey) {
    logger.error('RESEND_API_KEY manquant — envoi contact support impossible')
    throw new Error(RESEND_KEY_MISSING_ERROR)
  }

  const to = process.env.CONTACT_SUPPORT_TO ?? DEFAULT_TO

  const subject = `[Contact ${payload.reference}] ${payload.reasonLabel}`

  const textLines = [
    `Reference: ${payload.reference}`,
    `Locale: ${payload.locale}`,
    payload.userId ? `User ID: ${payload.userId}` : 'User ID: (anonymous visitor)',
    '',
    `Last name: ${payload.lastName}`,
    `First name: ${payload.firstName}`,
    `Email (Reply-To): ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : 'Phone: —',
    '',
    `Reason (${payload.reasonKey}): ${payload.reasonLabel}`,
    '',
    'Message:',
    payload.message,
  ]

  const text = textLines.join('\n')

  const html = `
  <p><strong>Reference:</strong> ${escapeHtml(payload.reference)}</p>
  <p><strong>Locale:</strong> ${escapeHtml(payload.locale)}</p>
  <p><strong>User ID:</strong> ${payload.userId ? escapeHtml(payload.userId) : '(anonymous visitor)'}</p>
  <hr />
  <p><strong>Last name:</strong> ${escapeHtml(payload.lastName)}<br/>
  <strong>First name:</strong> ${escapeHtml(payload.firstName)}<br/>
  <strong>Email:</strong> ${escapeHtml(payload.email)}<br/>
  <strong>Phone:</strong> ${payload.phone ? escapeHtml(payload.phone) : '—'}</p>
  <p><strong>Reason (${escapeHtml(payload.reasonKey)}):</strong> ${escapeHtml(payload.reasonLabel)}</p>
  <p><strong>Message:</strong></p>
  <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(payload.message)}</pre>
  `.trim()

  await sendResendEmail({
    to: [to],
    replyTo: payload.email,
    subject,
    text,
    html,
  })
}
