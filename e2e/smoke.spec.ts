import { test, expect, type Page } from '@playwright/test'

type Locale = 'fr' | 'en'

function urlForLocale(locale: Locale, path: string) {
  const prefix = locale === 'en' ? '/en' : ''
  if (path === '/') return `${prefix}/`.replace(/\/+$/, '/')
  return `${prefix}${path}`
}

async function loginViaForm(page: Page, locale: Locale, email: string, password: string) {
  await page.goto(urlForLocale(locale, '/login'))

  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)

  // Login page has both "login" and "signup" forms; we only submit the one containing #email.
  const loginForm = page.locator('form').filter({ has: page.locator('#email') })
  await loginForm.locator('button[type="submit"]').click()

  await page.waitForURL(/\/dashboard(\/|$)/, { timeout: 60_000 })
}

test.describe('Smoke - parcours critiques', () => {
  test('Landing + header public (FR/EN)', async ({ page }) => {
    for (const locale of ['fr', 'en'] as const) {
      await page.goto(urlForLocale(locale, '/'))

      await expect(page.getByRole('link', { name: /My Sport Ally/i })).toBeVisible()
      await expect(page.locator('#language-switcher')).toBeVisible()
      await expect(page.locator('#language-switcher')).toContainText(locale.toUpperCase())
    }
  })

  test('Login page rend les champs (FR/EN)', async ({ page }) => {
    for (const locale of ['fr', 'en'] as const) {
      await page.goto(urlForLocale(locale, '/login'))
      await expect(page.locator('#email')).toBeVisible()
      await expect(page.locator('#password')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    }
  })

  test('Dashboard non authentifié => redirection login', async ({ page }) => {
    // La locale "fr" est sans préfixe (localePrefix: as-needed).
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/(en\/|fr\/)?login/)
  })

  test('Athlete: /dashboard => calendrier ou recherche coach', async ({ page }) => {
    test.skip(
      !process.env.E2E_ATHLETE_EMAIL || !process.env.E2E_ATHLETE_PASSWORD,
      'E2E_ATHLETE_EMAIL / E2E_ATHLETE_PASSWORD requis'
    )

    const email = process.env.E2E_ATHLETE_EMAIL as string
    const password = process.env.E2E_ATHLETE_PASSWORD as string

    await loginViaForm(page, 'fr', email, password)
    await expect(page).toHaveURL(/\/dashboard\/(calendar|find-coach)(\/|$)/)
  })

  test('Coach: /dashboard/profile/offers => rend le formulaire', async ({ page }) => {
    test.skip(
      !process.env.E2E_COACH_EMAIL || !process.env.E2E_COACH_PASSWORD,
      'E2E_COACH_EMAIL / E2E_COACH_PASSWORD requis'
    )

    const email = process.env.E2E_COACH_EMAIL as string
    const password = process.env.E2E_COACH_PASSWORD as string

    await loginViaForm(page, 'fr', email, password)
    await page.goto('/dashboard/profile/offers')
    await expect(page.locator('#offers-form')).toBeVisible()
  })
})

