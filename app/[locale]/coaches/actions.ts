'use server'

import { setPostAuthRedirectCookie } from '@/lib/postAuthRedirect.server'

export async function savePostAuthRedirect(redirectPath: string): Promise<void> {
  await setPostAuthRedirectCookie(redirectPath)
}
