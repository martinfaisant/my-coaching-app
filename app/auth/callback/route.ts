import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Si c'est une confirmation d'email, rediriger vers le dashboard
      if (type === 'signup' || !next) {
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      }
      // Sinon, utiliser le paramètre next (pour reset password, etc.)
      return NextResponse.redirect(new URL(next || '/dashboard', requestUrl.origin))
    }
  }

  // Si erreur ou pas de code, rediriger vers login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
