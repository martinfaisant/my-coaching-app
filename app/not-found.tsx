/**
 * Root not-found.tsx to avoid Turbopack instantiating the internal /_not-found
 * template (boundary-components.js) in a context where the module factory is not available.
 * Kept minimal: no next-intl, no next/link — plain HTML so it works without [locale] layout.
 */
export default function RootNotFound() {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#1a1a1a' }}>Page not found / Page non trouvée</h1>
        <p style={{ color: '#666' }}>404</p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: '#2c3e2e',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
          }}
        >
          Retour à l&apos;accueil / Back to home
        </a>
      </body>
    </html>
  )
}
