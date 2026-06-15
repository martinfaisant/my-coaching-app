export type PublicHeaderTitleNamespace = 'coachPricingPublic' | 'metadata' | 'auth'

export type PublicHeaderTitleI18n = {
  namespace: PublicHeaderTitleNamespace
  key: string
}

/**
 * Titre centré dans la barre mobile `PublicHeader` selon la route publique courante.
 */
export function getPublicHeaderPageTitleI18n(pathname: string): PublicHeaderTitleI18n {
  switch (pathname) {
    case '/':
      return { namespace: 'coachPricingPublic', key: 'navHome' }
    case '/pricing':
      return { namespace: 'coachPricingPublic', key: 'navPricing' }
    case '/coaches':
      return { namespace: 'coachPricingPublic', key: 'navFindCoach' }
    case '/contact':
      return { namespace: 'metadata', key: 'contactTitle' }
    case '/terms':
      return { namespace: 'metadata', key: 'termsTitle' }
    case '/privacy':
      return { namespace: 'metadata', key: 'privacyTitle' }
    case '/faq/athlete':
      return { namespace: 'metadata', key: 'faqAthleteTitle' }
    case '/faq/coach':
      return { namespace: 'metadata', key: 'faqCoachTitle' }
    case '/reset-password':
      return { namespace: 'auth', key: 'resetPassword' }
    default:
      return { namespace: 'coachPricingPublic', key: 'navHome' }
  }
}
