import { logger } from '@/lib/logger'

const RESEND_API_URL = 'https://api.resend.com/emails'

const DEFAULT_FROM = 'My Sport Ally <no-reply@mysportally.com>'

/** Jeté si aucune clé API n’est trouvée. */
export const RESEND_KEY_MISSING_ERROR = 'RESEND_API_KEY_MISSING'

export function getResendApiKey(): string {
  const primary = process.env.RESEND_API_KEY?.trim()
  if (primary) return primary
  const alias = process.env.RESEND_KEY?.trim()
  return alias ?? ''
}

export function getResendFromAddress(): string {
  return process.env.CONTACT_EMAIL_FROM ?? DEFAULT_FROM
}

export type SendResendEmailParams = {
  to: string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

/**
 * Envoie un e-mail via l’API Resend.
 * @throws si clé absente ou réponse HTTP non OK
 */
export async function sendResendEmail(params: SendResendEmailParams): Promise<void> {
  const apiKey = getResendApiKey()
  if (!apiKey) {
    logger.error('RESEND_API_KEY manquant — envoi e-mail impossible')
    throw new Error(RESEND_KEY_MISSING_ERROR)
  }

  const body: Record<string, unknown> = {
    from: getResendFromAddress(),
    to: params.to,
    subject: params.subject,
    html: params.html,
  }
  if (params.text) body.text = params.text
  if (params.replyTo) body.reply_to = params.replyTo

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errBody = await res.text()
    logger.error('Resend email failed', new Error(errBody.slice(0, 500)), {
      status: res.status,
    })
    throw new Error('RESEND_FAILED')
  }
}
