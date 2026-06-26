import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Remplace les placeholders {{key}} dans un template HTML.
 * Les valeurs sont insérées telles quelles (échappement à la charge de l’appelant).
 */
export function renderEmailTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? '')
}

let coachingRequestCoachTemplateCache: string | null = null
let coachingRequestResponseAcceptedAthleteTemplateCache: string | null = null
let coachingRequestResponseDeclinedAthleteTemplateCache: string | null = null

function loadEmailTemplateFromDocs(filename: string): string {
  const filePath = join(process.cwd(), 'docs', 'email-templates', filename)
  const raw = readFileSync(filePath, 'utf-8')
  const doctypeIndex = raw.indexOf('<!DOCTYPE html>')
  return doctypeIndex >= 0 ? raw.slice(doctypeIndex) : raw
}

/** Charge docs/email-templates/coaching-request-coach.html (cache mémoire). */
export function loadCoachingRequestCoachEmailTemplate(): string {
  if (coachingRequestCoachTemplateCache) return coachingRequestCoachTemplateCache
  coachingRequestCoachTemplateCache = loadEmailTemplateFromDocs('coaching-request-coach.html')
  return coachingRequestCoachTemplateCache
}

/** Charge docs/email-templates/coaching-request-response-accepted-athlete.html (cache mémoire). */
export function loadCoachingRequestResponseAcceptedAthleteEmailTemplate(): string {
  if (coachingRequestResponseAcceptedAthleteTemplateCache) {
    return coachingRequestResponseAcceptedAthleteTemplateCache
  }
  coachingRequestResponseAcceptedAthleteTemplateCache = loadEmailTemplateFromDocs(
    'coaching-request-response-accepted-athlete.html',
  )
  return coachingRequestResponseAcceptedAthleteTemplateCache
}

/** Charge docs/email-templates/coaching-request-response-declined-athlete.html (cache mémoire). */
export function loadCoachingRequestResponseDeclinedAthleteEmailTemplate(): string {
  if (coachingRequestResponseDeclinedAthleteTemplateCache) {
    return coachingRequestResponseDeclinedAthleteTemplateCache
  }
  coachingRequestResponseDeclinedAthleteTemplateCache = loadEmailTemplateFromDocs(
    'coaching-request-response-declined-athlete.html',
  )
  return coachingRequestResponseDeclinedAthleteTemplateCache
}

/** Réinitialise les caches (tests). */
export function clearCoachingRequestCoachEmailTemplateCache(): void {
  coachingRequestCoachTemplateCache = null
}

export function clearCoachingRequestResponseAthleteEmailTemplateCaches(): void {
  coachingRequestResponseAcceptedAthleteTemplateCache = null
  coachingRequestResponseDeclinedAthleteTemplateCache = null
}
