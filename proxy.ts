import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { isOAuthSignupPending } from '@/lib/authOAuth'

const intlMiddleware = createIntlMiddleware(routing)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip i18n pour API, callback OAuth, sitemap et robots (sinon 404 — next-intl réécrit ces URLs)
  const isApiRoute =
    pathname.startsWith('/api') ||
    pathname === '/auth/callback' ||
    pathname.startsWith('/auth/callback/')

  const isSeoMetadataRoute =
    pathname === '/sitemap.xml' || pathname === '/robots.txt' || pathname === '/llms.txt'
  
  // Handle i18n first (unless it's an API route or SEO metadata file)
  let response: NextResponse
  if (isApiRoute || isSeoMetadataRoute) {
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

  // Protected routes (dashboard and admin)
  const isProtectedRoute = pathnameWithoutLocale.startsWith('/dashboard') || pathnameWithoutLocale.startsWith('/admin')
  const isOAuthCompleteSignupRoute = pathnameWithoutLocale === '/auth/complete-signup'

  // Never redirect POST requests: they are typically Next.js Server Actions.
  // Redirecting would return HTML/302 instead of the RSC payload and cause
  // "An unexpected response was received from the server" on the client.
  const isGet = request.method === 'GET' || request.method === 'HEAD'

  if (!user && isOAuthCompleteSignupRoute && isGet) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = locale === 'en' ? '/en/login' : '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // If user is not logged in and tries to access protected route
  if (!user && isProtectedRoute && isGet) {
    const redirectUrl = request.nextUrl.clone()
    // Au lieu de rediriger vers `/login?redirect=...`, on renvoie sur la page d'accueil.
    // Cela correspond à la demande produit: route protégée => page d'accueil.
    redirectUrl.pathname = locale === 'en' ? '/en' : '/'
    redirectUrl.searchParams.delete('redirect')
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isGet) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_locale, role')
      .eq('user_id', user.id)
      .single()

    const oauthPending = isOAuthSignupPending(user)
    const hasProfile = Boolean(profile?.role)

    if (oauthPending && !hasProfile && isProtectedRoute) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname =
        locale === 'en' ? '/en/auth/complete-signup' : '/auth/complete-signup'
      return NextResponse.redirect(redirectUrl)
    }

    if (hasProfile && isOAuthCompleteSignupRoute) {
      const preferred =
        profile?.preferred_locale === 'fr' || profile?.preferred_locale === 'en'
          ? profile.preferred_locale
          : null
      const targetLocale = preferred ?? locale
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = targetLocale === 'fr' ? '/dashboard' : '/en/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    // If user is logged in and tries to access /login
    if (pathnameWithoutLocale === '/login') {
      if (oauthPending && !hasProfile) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname =
          locale === 'en' ? '/en/auth/complete-signup' : '/auth/complete-signup'
        return NextResponse.redirect(redirectUrl)
      }

      if (hasProfile) {
        const preferred =
          profile?.preferred_locale === 'fr' || profile?.preferred_locale === 'en'
            ? profile.preferred_locale
            : null
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
    }
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
    // - sitemap.xml / robots.txt / llms.txt (must not pass through next-intl middleware)
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|llms.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
