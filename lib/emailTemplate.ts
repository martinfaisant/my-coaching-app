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

/** Charge docs/email-templates/coaching-request-coach.html (cache mémoire). */
export function loadCoachingRequestCoachEmailTemplate(): string {
  if (coachingRequestCoachTemplateCache) return coachingRequestCoachTemplateCache
  const filePath = join(process.cwd(), 'docs', 'email-templates', 'coaching-request-coach.html')
  const raw = readFileSync(filePath, 'utf-8')
  const doctypeIndex = raw.indexOf('<!DOCTYPE html>')
  coachingRequestCoachTemplateCache = doctypeIndex >= 0 ? raw.slice(doctypeIndex) : raw
  return coachingRequestCoachTemplateCache
}

/** Réinitialise le cache (tests). */
export function clearCoachingRequestCoachEmailTemplateCache(): void {
  coachingRequestCoachTemplateCache = null
}
