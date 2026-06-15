import { cookies } from 'next/headers'
import {
  POST_AUTH_REDIRECT_COOKIE,
  validatePostAuthRedirect,
} from '@/lib/postAuthRedirect'

const COOKIE_MAX_AGE_SECONDS = 60 * 10

export async function setPostAuthRedirectCookie(redirectPath: string): Promise<void> {
  const validated = validatePostAuthRedirect(redirectPath)
  if (!validated) return

  const cookieStore = await cookies()
  cookieStore.set(POST_AUTH_REDIRECT_COOKIE, validated, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: '/',
  })
}

export async function readPostAuthRedirectCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  return validatePostAuthRedirect(cookieStore.get(POST_AUTH_REDIRECT_COOKIE)?.value)
}

export async function clearPostAuthRedirectCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(POST_AUTH_REDIRECT_COOKIE)
}

/**
 * Lit et efface le cookie de redirection post-auth.
 */
export async function consumePostAuthRedirectCookie(): Promise<string | null> {
  const path = await readPostAuthRedirectCookie()
  if (path) {
    await clearPostAuthRedirectCookie()
  }
  return path
}
