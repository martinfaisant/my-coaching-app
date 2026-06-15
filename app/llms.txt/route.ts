import { buildLlmsTxtContent } from '@/lib/llmsTxt'

export function GET(): Response {
  const body = buildLlmsTxtContent()

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
