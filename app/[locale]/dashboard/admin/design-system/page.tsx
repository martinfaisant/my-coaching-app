import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { requireRole } from '@/utils/auth'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { ButtonShowcase } from './ButtonShowcase'
import { InputShowcase } from './InputShowcase'
import { TextareaShowcase } from './TextareaShowcase'
import { BadgeShowcase } from './BadgeShowcase'
import { ModalShowcase } from './ModalShowcase'
import { ActivityTileShowcase } from './ActivityTileShowcase'
import { TileCardShowcase } from './TileCardShowcase'
import { LanguageSwitcherShowcase } from './LanguageSwitcherShowcase'
import { LanguagePrefixFieldShowcase } from './LanguagePrefixFieldShowcase'
import { PersonTileShowcase } from './PersonTileShowcase'
import { ChatShowcase } from './ChatShowcase'
import { TypographyTable } from './TypographyTable'

const PALETTE = [
  { token: 'palette-forest-dark', hex: '#627e59', descriptionKey: 'forestDark' },
  { token: 'palette-forest-darker', hex: '#506648', descriptionKey: 'forestDarker' },
  { token: 'palette-olive', hex: '#8e9856', descriptionKey: 'olive' },
  { token: 'palette-sage', hex: '#aaaa51', descriptionKey: 'sage' },
  { token: 'palette-gold', hex: '#cbb44b', descriptionKey: 'gold' },
  { token: 'palette-amber', hex: '#c9a544', descriptionKey: 'amber' },
  { token: 'palette-strava', hex: '#FC4C02', descriptionKey: 'strava' },
  { token: 'palette-danger', hex: '#c0564b', descriptionKey: 'danger' },
  { token: 'palette-danger-light', hex: '#fdf2f1', descriptionKey: 'dangerLight' },
  { token: 'palette-danger-dark', hex: '#9e3b31', descriptionKey: 'dangerDark' },
] as const

export default async function DesignSystemPage() {
  await requireRole(['admin'])
  const t = await getTranslations('adminDesignSystem')

  return (
    <DashboardPageShell contentClassName="py-8">
        <p className="mb-8 flex flex-wrap items-center justify-between gap-4 text-stone-600">
          <span>{t('intro')}</span>
          <Link
            href="/dashboard/admin/members"
            className="shrink-0 text-sm font-medium text-stone-500 hover:text-palette-forest-dark"
          >
            {t('membersLink')}
          </Link>
        </p>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            {t('sections.palette.title')}
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PALETTE.map(({ token, hex, descriptionKey }) => (
              <div
                key={token}
                className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="h-24 w-full"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
                <div className="p-4">
                  <code className="text-sm font-mono font-medium text-stone-800">
                    {token}
                  </code>
                  <p className="mt-0.5 text-xs text-stone-500 font-mono">
                    {hex}
                  </p>
                  <p className="mt-2 text-sm text-stone-600">
                    {t(`sections.palette.${descriptionKey}`)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-block rounded px-2 py-0.5 text-[10px] font-mono bg-stone-100 text-stone-600">
                      bg-{token}
                    </span>
                    <span className="inline-block rounded px-2 py-0.5 text-[10px] font-mono bg-stone-100 text-stone-600">
                      text-{token}
                    </span>
                    <span className="inline-block rounded px-2 py-0.5 text-[10px] font-mono bg-stone-100 text-stone-600">
                      border-{token}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            {t('sections.button.title')}
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            {t('sections.button.description')}
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <ButtonShowcase />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            {t('sections.inputs.title')}
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            {t('sections.inputs.description')}
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <div className="space-y-12">
              <div>
                <h3 className="text-base font-semibold text-stone-800 mb-4">{t('sections.inputs.inputTitle')}</h3>
                <InputShowcase />
              </div>
              <div className="pt-8 border-t border-stone-200">
                <h3 className="text-base font-semibold text-stone-800 mb-4">{t('sections.inputs.textareaTitle')}</h3>
                <TextareaShowcase />
              </div>
              <div className="pt-8 border-t border-stone-200">
                <h3 className="text-base font-semibold text-stone-800 mb-4">{t('sections.inputs.languagePrefixTitle')}</h3>
                <LanguagePrefixFieldShowcase />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            {t('sections.typography.title')}
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            {t('sections.typography.description')}
          </p>
          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
            <TypographyTable />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            {t('sections.badge.title')}
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            {t('sections.badge.description')}
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <BadgeShowcase />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            {t('sections.activityTile.title')}
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            {t('sections.activityTile.description')}
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <ActivityTileShowcase />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            {t('sections.tileCard.title')}
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            {t('sections.tileCard.description')}
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <TileCardShowcase />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            {t('sections.personTiles.title')}
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            {t('sections.personTiles.description')}
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <PersonTileShowcase />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            {t('sections.modal.title')}
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            {t('sections.modal.description')}
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <ModalShowcase />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            {t('sections.languageSwitcher.title')}
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            {t('sections.languageSwitcher.description')}
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <LanguageSwitcherShowcase />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            {t('sections.chat.title')}
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            {t('sections.chat.description')}
          </p>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <ChatShowcase />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            {t('sections.tailwindPreview.title')}
          </h2>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <div className="flex flex-wrap gap-4 items-center">
              {PALETTE.map(({ token, hex }) => (
                <div key={token} className="flex flex-col items-center gap-1">
                  <div
                    className="h-12 w-12 rounded-lg"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-xs text-stone-500">{token.replace('palette-', '')}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </DashboardPageShell>
  )
}
