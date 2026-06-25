import { describe, expect, it } from 'vitest'
import { escapeHtmlForEmail } from '@/lib/coachRequestNotificationEmail'
import { renderEmailTemplate } from '@/lib/emailTemplate'
import { formatCoachRequestSportsLabel } from '@/lib/formatCoachRequestSportsLabel'

describe('escapeHtmlForEmail', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtmlForEmail('<script>"&"</script>')).toBe(
      '&lt;script&gt;&quot;&amp;&quot;&lt;/script&gt;',
    )
  })
})

describe('renderEmailTemplate', () => {
  it('replaces placeholders', () => {
    const html = renderEmailTemplate('<p>{{name}}</p>', { name: 'Marie' })
    expect(html).toBe('<p>Marie</p>')
  })
})

describe('formatCoachRequestSportsLabel', () => {
  it('maps sport keys to translated labels', () => {
    const label = formatCoachRequestSportsLabel('course,velo', (key) => `T:${key}`)
    expect(label).toBe('T:course · T:velo')
  })
})
