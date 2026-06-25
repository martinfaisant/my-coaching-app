import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { clearCoachingRequestCoachEmailTemplateCache, loadCoachingRequestCoachEmailTemplate } from '@/lib/emailTemplate'

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
