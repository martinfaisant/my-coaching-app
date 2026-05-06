import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/server'
import { logger } from '@/lib/logger'

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

/**
 * Clôture quotidienne des souscriptions « en résiliation » dont la date de fin est passée.
 * Sécurisé par CRON_SECRET (header Authorization: Bearer …), aligné sur Vercel Cron.
 */
export async function GET(request: NextRequest) {
  if (process.env.DEBUG_CRON_AUTH === 'true') {
    const auth = request.headers.get('authorization')
    logger.info('process-expired-subscriptions: auth debug', {
      receivedAuthorization: auth,
      expectedAuthorization: `Bearer ${process.env.CRON_SECRET ?? ''}`,
      hasCronSecret: Boolean(process.env.CRON_SECRET),
      vercelEnv: process.env.VERCEL_ENV ?? null,
    })
  }

  if (!isAuthorized(request)) {
    logger.warn('process-expired-subscriptions: unauthorized or missing CRON_SECRET')
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.rpc('process_expired_subscription_cancellations')
    if (error) {
      logger.error('process-expired-subscriptions: rpc failed', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    logger.error('process-expired-subscriptions: unexpected error', e)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
