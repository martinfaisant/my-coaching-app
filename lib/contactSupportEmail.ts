import { logger } from '@/lib/logger'

const RESEND_API_URL = 'https://api.resend.com/emails'

const DEFAULT_FROM = 'My Sport Ally <no-reply@mysportally.com>'
const DEFAULT_TO = 'support@mysportally.com'

/** Jeté si aucune clé API n’est trouvée (voir `getResendApiKey`). */
export const RESEND_KEY_MISSING_ERROR = 'RESEND_API_KEY_MISSING'

function getResendApiKey(): string {
  const primary = process.env.RESEND_API_KEY?.trim()
  if (primary) return primary
  // Alias toléré (évite les .env mal nommés) — préférer RESEND_API_KEY (doc Resend).
  const alias = process.env.RESEND_KEY?.trim()
  return alias ?? ''
}

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

  const from = process.env.CONTACT_EMAIL_FROM ?? DEFAULT_FROM
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

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: payload.email,
      subject,
      text,
      html,
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    logger.error('Resend contact email failed', new Error(errBody.slice(0, 500)), {
      status: res.status,
    })
    throw new Error('RESEND_FAILED')
  }
}
