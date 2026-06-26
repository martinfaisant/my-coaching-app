import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import {
  clearCoachingRequestCoachEmailTemplateCache,
  clearCoachingRequestResponseAthleteEmailTemplateCaches,
  loadCoachingRequestCoachEmailTemplate,
  loadCoachingRequestResponseAcceptedAthleteEmailTemplate,
  loadCoachingRequestResponseDeclinedAthleteEmailTemplate,
} from '@/lib/emailTemplate'

describe('loadCoachingRequestCoachEmailTemplate', () => {
  it('loads docs/email-templates/coaching-request-coach.html', () => {
    clearCoachingRequestCoachEmailTemplateCache()
    const html = loadCoachingRequestCoachEmailTemplate()
    const file = readFileSync(
      join(process.cwd(), 'docs', 'email-templates', 'coaching-request-coach.html'),
      'utf-8',
    )
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('{{heading}}')
    expect(file).toContain('{{footerNotificationsHtml}}')
  })
})

describe('loadCoachingRequestResponseAthleteEmailTemplates', () => {
  it('loads accepted and declined athlete templates', () => {
    clearCoachingRequestResponseAthleteEmailTemplateCaches()
    const accepted = loadCoachingRequestResponseAcceptedAthleteEmailTemplate()
    const declined = loadCoachingRequestResponseDeclinedAthleteEmailTemplate()
    expect(accepted).toContain('{{sportsValue}}')
    expect(declined).toContain('{{encouragementHtml}}')
    expect(accepted).toContain('/logo.png')
    expect(declined).toContain('/logo.png')
  })
})
