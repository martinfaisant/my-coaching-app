import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip i18n for API routes and auth callbacks
  const isApiRoute = pathname.startsWith('/api') || pathname.startsWith('/auth')
  
  // Handle i18n first (unless it's an API route)
  let response: NextResponse
  if (isApiRoute) {
    response = NextResponse.next({ request })
  } else {
    response = intlMiddleware(request)
  }

  // Then handle Supabase auth
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
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if necessary
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Extract locale from pathname if present
  const localeMatch = pathname.match(/^\/(fr|en)(\/|$)/)
  const locale = localeMatch ? localeMatch[1] : 'fr'
  const pathnameWithoutLocale = localeMatch ? pathname.slice(3) || '/' : pathname

  // Public routes accessible without authentication
  const publicRoutes = [
    '/',
    '/login',
    '/reset-password',
  ]

  // Check if route is public
  const isPublicRoute = publicRoutes.includes(pathnameWithoutLocale) || isApiRoute

  // Protected routes (dashboard and admin)
  const isProtectedRoute = pathnameWithoutLocale.startsWith('/dashboard') || pathnameWithoutLocale.startsWith('/admin')

  // Never redirect POST requests: they are typically Next.js Server Actions.
  // Redirecting would return HTML/302 instead of the RSC payload and cause
  // "An unexpected response was received from the server" on the client.
  const isGet = request.method === 'GET' || request.method === 'HEAD'

  // If user is not logged in and tries to access protected route
  if (!user && isProtectedRoute && isGet) {
    const redirectUrl = request.nextUrl.clone()
    // Au lieu de rediriger vers `/login?redirect=...`, on renvoie sur la page d'accueil.
    // Cela correspond à la demande produit: route protégée => page d'accueil.
    redirectUrl.pathname = locale === 'en' ? '/en' : '/'
    redirectUrl.searchParams.delete('redirect')
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and tries to access /login
  if (user && pathnameWithoutLocale === '/login' && isGet) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_locale')
      .eq('user_id', user.id)
      .single()
    const preferred = profile?.preferred_locale === 'fr' || profile?.preferred_locale === 'en' ? profile.preferred_locale : null
    const targetLocale = preferred ?? locale

    const redirectUrl = request.nextUrl.clone()
    const redirectParam = request.nextUrl.searchParams.get('redirect')
    if (redirectParam && redirectParam.includes('/dashboard')) {
      redirectUrl.pathname = redirectParam
      redirectUrl.searchParams.delete('redirect')
    } else {
      redirectUrl.pathname = targetLocale === 'fr' ? '/dashboard' : '/en/dashboard'
    }
    return NextResponse.redirect(redirectUrl)
  }

  // Logged-in user: redirect to preferred display locale if set and different from current path.
  // Exclure la page profil pour permettre d'y changer la langue (sélecteur ou LanguageSwitcher) puis enregistrer.
  const isProfilePage = pathnameWithoutLocale === '/dashboard/profile'
  if (user && isGet && !isApiRoute && !isProfilePage && (isProtectedRoute || pathnameWithoutLocale === '/')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_locale')
      .eq('user_id', user.id)
      .single()

    const preferred = profile?.preferred_locale === 'fr' || profile?.preferred_locale === 'en' ? profile.preferred_locale : null
    if (preferred && preferred !== locale) {
      const targetPath = preferred === 'fr' ? pathnameWithoutLocale : `/en${pathnameWithoutLocale === '/' ? '' : pathnameWithoutLocale}`
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = targetPath
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    // Match all pathnames except for:
    // - Static files and assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
