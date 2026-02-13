import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Rafraîchir la session si nécessaire (important pour maintenir l'authentification)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Routes publiques accessibles sans authentification
  const publicRoutes = [
    '/',
    '/login',
    '/reset-password',
    '/auth/callback',
    '/api/auth/strava',
    '/api/auth/strava/callback',
  ]

  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some((route) => pathname === route)

  // Routes protégées (dashboard et admin)
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  // Si l'utilisateur n'est pas connecté et tente d'accéder à une route protégée
  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    // Sauvegarder l'URL d'origine pour rediriger après la connexion
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si l'utilisateur est connecté et tente d'accéder à /login
  if (user && pathname === '/login') {
    const redirectUrl = request.nextUrl.clone()
    // S'il y a un paramètre 'redirect', utiliser celui-ci, sinon rediriger vers /dashboard
    const redirectParam = request.nextUrl.searchParams.get('redirect')
    if (redirectParam && redirectParam.startsWith('/dashboard')) {
      redirectUrl.pathname = redirectParam
      redirectUrl.searchParams.delete('redirect')
    } else {
      redirectUrl.pathname = '/dashboard'
    }
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
