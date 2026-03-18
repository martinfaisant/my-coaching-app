import { getTranslations } from 'next-intl/server'

type TypographyDecision = 'keep' | 'replace'

type TypographyRow = {
  key: string
  currentLabelKey: string
  currentClasses: string
  currentExampleClasses: string
  exampleTextKey: string
  usedIn: { path: string; noteKey?: string }[]
  decision: TypographyDecision
  replacementKey?: string
}

const ROWS: TypographyRow[] = [
  {
    key: 'modalTitle',
    currentLabelKey: 'rows.modalTitle.label',
    currentClasses: 'text-lg font-bold text-stone-900',
    currentExampleClasses: 'text-lg font-bold text-stone-900',
    exampleTextKey: 'examples.titles.modal',
    usedIn: [{ path: 'components/Modal.tsx' }],
    decision: 'keep',
  },
  {
    key: 'authTitle',
    currentLabelKey: 'rows.authTitle.label',
    currentClasses: 'text-2xl font-semibold text-stone-900',
    currentExampleClasses: 'text-2xl font-semibold text-stone-900',
    exampleTextKey: 'examples.titles.auth',
    usedIn: [{ path: 'components/LoginForm.tsx' }, { path: 'app/[locale]/login/page.tsx' }],
    decision: 'keep',
  },
  {
    key: 'publicHeroTitle',
    currentLabelKey: 'rows.publicHeroTitle.label',
    currentClasses: 'text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-900',
    currentExampleClasses: 'text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900',
    exampleTextKey: 'examples.titles.hero',
    usedIn: [{ path: 'app/[locale]/page.tsx' }],
    decision: 'keep',
  },
  {
    key: 'publicSectionTitle',
    currentLabelKey: 'rows.publicSectionTitle.label',
    currentClasses: 'text-3xl sm:text-4xl font-bold text-stone-900',
    currentExampleClasses: 'text-2xl sm:text-3xl font-bold text-stone-900',
    exampleTextKey: 'examples.titles.section',
    usedIn: [{ path: 'app/[locale]/page.tsx' }],
    decision: 'keep',
  },
  {
    key: 'publicHeaderLogo',
    currentLabelKey: 'rows.publicHeaderLogo.label',
    currentClasses: 'text-xl font-semibold text-stone-900 tracking-tight',
    currentExampleClasses: 'text-xl font-semibold text-stone-900 tracking-tight',
    exampleTextKey: 'examples.brand.appName',
    usedIn: [{ path: 'components/PublicHeader.tsx' }],
    decision: 'keep',
  },
  {
    key: 'heroButtons',
    currentLabelKey: 'rows.heroButtons.label',
    currentClasses: 'text-lg font-semibold',
    currentExampleClasses: 'text-lg font-semibold text-stone-900',
    exampleTextKey: 'examples.actions.cta',
    usedIn: [{ path: 'components/AuthButtons.tsx', noteKey: 'usedInNotes.heroVariant' }],
    decision: 'keep',
  },
  {
    key: 'navLink',
    currentLabelKey: 'rows.navLink.label',
    currentClasses: 'text-sm font-medium',
    currentExampleClasses: 'text-sm font-medium text-stone-700',
    exampleTextKey: 'examples.navigation.link',
    usedIn: [{ path: 'components/DashboardNavLinks.tsx' }],
    decision: 'keep',
  },
  {
    key: 'dashboardMobilePageTitle',
    currentLabelKey: 'rows.dashboardMobilePageTitle.label',
    currentClasses: 'text-sm font-semibold text-stone-800',
    currentExampleClasses: 'text-sm font-semibold text-stone-800',
    exampleTextKey: 'examples.titles.page',
    usedIn: [{ path: 'components/DashboardTopBar.tsx' }],
    decision: 'keep',
  },
  {
    key: 'dashboardBrand',
    currentLabelKey: 'rows.dashboardBrand.label',
    currentClasses: 'text-base font-bold text-stone-800',
    currentExampleClasses: 'text-base font-bold text-stone-800',
    exampleTextKey: 'examples.brand.appName',
    usedIn: [{ path: 'components/DashboardTopBar.tsx' }],
    decision: 'keep',
  },
  {
    key: 'personTileName',
    currentLabelKey: 'rows.personTileName.label',
    currentClasses: 'text-lg font-bold leading-tight text-stone-900',
    currentExampleClasses: 'text-lg font-bold leading-tight text-stone-900',
    exampleTextKey: 'examples.people.name',
    usedIn: [{ path: 'components/CoachTile.tsx' }, { path: 'components/AthleteTile.tsx' }],
    decision: 'keep',
  },
  {
    key: 'personTileReviewsLine',
    currentLabelKey: 'rows.personTileReviewsLine.label',
    currentClasses: 'text-xs text-stone-500 + rating: text-amber-500 font-bold',
    currentExampleClasses: 'text-xs text-stone-500',
    exampleTextKey: 'examples.misc.ratingLine',
    usedIn: [{ path: 'components/CoachTile.tsx', noteKey: 'usedInNotes.reviewsLine' }],
    decision: 'keep',
  },
  {
    key: 'personTileNewBadge',
    currentLabelKey: 'rows.personTileNewBadge.label',
    currentClasses: 'text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded',
    currentExampleClasses: 'text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded',
    exampleTextKey: 'examples.badges.new',
    usedIn: [{ path: 'components/CoachTile.tsx' }],
    decision: 'replace',
    replacementKey: 'proposed.microBadge',
  },
  {
    key: 'personTileBio',
    currentLabelKey: 'rows.personTileBio.label',
    currentClasses: 'text-sm text-stone-500 leading-relaxed',
    currentExampleClasses: 'text-sm text-stone-500 leading-relaxed',
    exampleTextKey: 'examples.misc.bio',
    usedIn: [{ path: 'components/CoachTile.tsx' }],
    decision: 'keep',
  },
  {
    key: 'offersBlockLabel',
    currentLabelKey: 'rows.offersBlockLabel.label',
    currentClasses: 'text-[10px] font-bold text-stone-400 uppercase tracking-wider',
    currentExampleClasses: 'text-[10px] font-bold text-stone-400 uppercase tracking-wider',
    exampleTextKey: 'examples.misc.availableOffers',
    usedIn: [{ path: 'components/CoachTile.tsx' }],
    decision: 'replace',
    replacementKey: 'proposed.microUpper',
  },
  {
    key: 'offerTitle',
    currentLabelKey: 'rows.offerTitle.label',
    currentClasses: 'text-xs font-medium (ou font-semibold) text-stone-600/700',
    currentExampleClasses: 'text-xs font-medium text-stone-600',
    exampleTextKey: 'examples.misc.offerTitle',
    usedIn: [{ path: 'components/CoachTile.tsx' }],
    decision: 'keep',
  },
  {
    key: 'offerFreeBadge',
    currentLabelKey: 'rows.offerFreeBadge.label',
    currentClasses: 'text-xs font-bold text-palette-forest-dark (pill)',
    currentExampleClasses: 'text-xs font-bold text-palette-forest-dark bg-palette-forest-dark/10 px-1.5 py-0.5 rounded',
    exampleTextKey: 'examples.misc.free',
    usedIn: [{ path: 'components/CoachTile.tsx' }],
    decision: 'keep',
  },
  {
    key: 'offerPrice',
    currentLabelKey: 'rows.offerPrice.label',
    currentClasses: 'text-xs font-bold text-stone-900 + suffix text-[10px] text-stone-400',
    currentExampleClasses: 'text-xs font-bold text-stone-900',
    exampleTextKey: 'examples.misc.price',
    usedIn: [{ path: 'components/CoachTile.tsx' }],
    decision: 'keep',
  },
  {
    key: 'offerPriceSuffix',
    currentLabelKey: 'rows.offerPriceSuffix.label',
    currentClasses: 'text-[10px] text-stone-400',
    currentExampleClasses: 'text-[10px] text-stone-400',
    exampleTextKey: 'examples.misc.perMonth',
    usedIn: [{ path: 'components/CoachTile.tsx' }],
    decision: 'keep',
  },
  {
    key: 'athleteSubscriptionLink',
    currentLabelKey: 'rows.athleteSubscriptionLink.label',
    currentClasses: 'text-sm font-medium text-palette-forest-dark',
    currentExampleClasses: 'text-sm font-medium text-palette-forest-dark',
    exampleTextKey: 'examples.actions.subscription',
    usedIn: [{ path: 'components/AthleteTile.tsx' }],
    decision: 'keep',
  },
  {
    key: 'athleteTileFieldLabel',
    currentLabelKey: 'rows.athleteTileFieldLabel.label',
    currentClasses: 'text-sm (hérité) + text-stone-500 font-medium',
    currentExampleClasses: 'text-sm text-stone-500 font-medium',
    exampleTextKey: 'examples.misc.fieldLabel',
    usedIn: [{ path: 'components/AthleteTile.tsx' }],
    decision: 'keep',
  },
  {
    key: 'athleteTileValue',
    currentLabelKey: 'rows.athleteTileValue.label',
    currentClasses: 'text-sm (hérité) + text-stone-900 (par défaut)',
    currentExampleClasses: 'text-sm text-stone-900',
    exampleTextKey: 'examples.misc.fieldValue',
    usedIn: [{ path: 'components/AthleteTile.tsx' }],
    decision: 'keep',
  },
  {
    key: 'athleteTileStatusMicro',
    currentLabelKey: 'rows.athleteTileStatusMicro.label',
    currentClasses: 'text-[10px] font-medium (stone-500 ou red-400)',
    currentExampleClasses: 'text-[10px] font-medium text-stone-500',
    exampleTextKey: 'examples.status.upToDate',
    usedIn: [{ path: 'components/AthleteTile.tsx' }],
    decision: 'replace',
    replacementKey: 'proposed.microStatus',
  },
  {
    key: 'tileTitleImplicit',
    currentLabelKey: 'rows.tileTitleImplicit.label',
    currentClasses: 'font-semibold text-stone-900 (sans text-*)',
    currentExampleClasses: 'font-semibold text-stone-900',
    exampleTextKey: 'examples.misc.tileTitle',
    usedIn: [{ path: 'components/ActivityTile.tsx' }],
    decision: 'replace',
    replacementKey: 'proposed.titleCard',
  },
  {
    key: 'tileMeta',
    currentLabelKey: 'rows.tileMeta.label',
    currentClasses: 'text-xs text-stone-500 font-semibold (+ séparateurs: text-sm font-bold)',
    currentExampleClasses: 'text-xs text-stone-500 font-semibold',
    exampleTextKey: 'examples.misc.meta',
    usedIn: [{ path: 'components/ActivityTile.tsx' }],
    decision: 'replace',
    replacementKey: 'proposed.metaInline',
  },
  {
    key: 'tileMicroLabelStrava',
    currentLabelKey: 'rows.tileMicroLabelStrava.label',
    currentClasses: 'text-[10px] font-bold uppercase … leading-none',
    currentExampleClasses: 'text-[10px] font-bold uppercase leading-none text-palette-strava bg-orange-100 px-1.5 py-0.5 rounded',
    exampleTextKey: 'examples.misc.stravaType',
    usedIn: [{ path: 'components/ActivityTile.tsx', noteKey: 'usedInNotes.stravaLabel' }],
    decision: 'replace',
    replacementKey: 'proposed.microUpper',
  },
  {
    key: 'goalTargetBadgeNumber',
    currentLabelKey: 'rows.goalTargetBadgeNumber.label',
    currentClasses: 'text-[10px] font-bold leading-none (1/2)',
    currentExampleClasses: 'text-[10px] font-bold leading-none text-palette-forest-dark',
    exampleTextKey: 'examples.goals.priorityNumber',
    usedIn: [{ path: 'components/CalendarView.tsx' }],
    decision: 'replace',
    replacementKey: 'proposed.microBadge',
  },
  {
    key: 'microUpperMixed',
    currentLabelKey: 'rows.microUpperMixed.label',
    currentClasses: 'text-[10px] font-bold uppercase (tracking variable)',
    currentExampleClasses: 'text-[10px] font-bold uppercase tracking-wider text-stone-400',
    exampleTextKey: 'examples.misc.microLabel',
    usedIn: [
      { path: 'components/ActivityTile.tsx', noteKey: 'usedInNotes.stravaLabel' },
      { path: 'app/[locale]/dashboard/objectifs/ObjectifsTable.tsx', noteKey: 'usedInNotes.goalDateBlock' },
      { path: 'app/[locale]/dashboard/RequestGoalsListModal.tsx', noteKey: 'usedInNotes.goalDateBlock' },
      { path: 'components/CoachAthleteCalendarPage.tsx', noteKey: 'usedInNotes.goalDateBlock' },
      { path: 'Language prefix field', noteKey: 'usedInNotes.languagePrefixField' },
    ],
    decision: 'replace',
    replacementKey: 'proposed.microUpper',
  },
  {
    key: 'weekSelectorRange',
    currentLabelKey: 'rows.weekSelectorRange.label',
    currentClasses: 'text-sm font-bold text-stone-800',
    currentExampleClasses: 'text-sm font-bold text-stone-800',
    exampleTextKey: 'examples.calendar.weekRange',
    usedIn: [{ path: 'components/WeekSelector.tsx' }],
    decision: 'keep',
  },
  {
    key: 'weekSelectorRangeSmallLines',
    currentLabelKey: 'rows.weekSelectorRangeSmallLines.label',
    currentClasses: 'text-xs font-bold text-stone-800 leading-tight',
    currentExampleClasses: 'text-xs font-bold text-stone-800 leading-tight',
    exampleTextKey: 'examples.calendar.weekRangeShort',
    usedIn: [{ path: 'components/WeekSelector.tsx', noteKey: 'usedInNotes.mobileTwoLines' }],
    decision: 'keep',
  },
  {
    key: 'weekSelectorSideLabel',
    currentLabelKey: 'rows.weekSelectorSideLabel.label',
    currentClasses: 'text-xs text-stone-600 truncate',
    currentExampleClasses: 'text-xs text-stone-600',
    exampleTextKey: 'examples.calendar.dayShort',
    usedIn: [{ path: 'components/WeekSelector.tsx' }],
    decision: 'keep',
  },
  {
    key: 'chatSidebarName',
    currentLabelKey: 'rows.chatSidebarName.label',
    currentClasses: 'text-sm font-medium truncate',
    currentExampleClasses: 'text-sm font-medium text-stone-700 truncate',
    exampleTextKey: 'examples.people.name',
    usedIn: [{ path: 'components/ChatConversationSidebar.tsx' }],
    decision: 'keep',
  },
  {
    key: 'chatSidebarAvatarInitials',
    currentLabelKey: 'rows.chatSidebarAvatarInitials.label',
    currentClasses: 'text-xs font-semibold',
    currentExampleClasses: 'text-xs font-semibold text-stone-700',
    exampleTextKey: 'examples.people.initials',
    usedIn: [{ path: 'components/ChatConversationSidebar.tsx' }],
    decision: 'keep',
  },
  {
    key: 'chatListActionLabel',
    currentLabelKey: 'rows.chatListActionLabel.label',
    currentClasses: 'text-xs font-medium text-palette-forest-dark',
    currentExampleClasses: 'text-xs font-medium text-palette-forest-dark',
    exampleTextKey: 'examples.actions.start',
    usedIn: [{ path: 'components/ChatAthleteListItem.tsx' }],
    decision: 'keep',
  },
  {
    key: 'logoutLabel',
    currentLabelKey: 'rows.logoutLabel.label',
    currentClasses: 'text-sm font-medium',
    currentExampleClasses: 'text-sm font-medium text-stone-700',
    exampleTextKey: 'examples.actions.logout',
    usedIn: [{ path: 'components/LogoutButton.tsx' }],
    decision: 'keep',
  },
  {
    key: 'buttonBase',
    currentLabelKey: 'rows.buttonBase.label',
    currentClasses: 'text-sm font-medium',
    currentExampleClasses: 'text-sm font-medium text-white bg-palette-forest-dark px-3 py-2 rounded-lg inline-flex',
    exampleTextKey: 'examples.actions.save',
    usedIn: [{ path: 'components/Button.tsx' }],
    decision: 'keep',
  },
  {
    key: 'badgeBase',
    currentLabelKey: 'rows.badgeBase.label',
    currentClasses: 'text-xs font-medium (pill)',
    currentExampleClasses: 'text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200 px-2.5 py-0.5 rounded-full inline-flex',
    exampleTextKey: 'examples.badges.sample',
    usedIn: [{ path: 'components/Badge.tsx' }, { path: 'components/TileCard.tsx', noteKey: 'usedInNotes.tileCardBadge' }],
    decision: 'keep',
  },
  {
    key: 'dropdownLabel',
    currentLabelKey: 'rows.dropdownLabel.label',
    currentClasses: 'text-sm font-medium text-stone-700',
    currentExampleClasses: 'text-sm font-medium text-stone-700',
    exampleTextKey: 'examples.forms.label',
    usedIn: [{ path: 'components/Dropdown.tsx' }],
    decision: 'keep',
  },
  {
    key: 'segmentsOptionMd',
    currentLabelKey: 'rows.segmentsOptionMd.label',
    currentClasses: 'text-sm font-medium (Segments size=md)',
    currentExampleClasses: 'text-sm font-medium text-stone-600',
    exampleTextKey: 'examples.misc.segmentOption',
    usedIn: [{ path: 'components/Segments.tsx', noteKey: 'usedInNotes.segmentsMd' }],
    decision: 'keep',
  },
  {
    key: 'segmentsOptionSm',
    currentLabelKey: 'rows.segmentsOptionSm.label',
    currentClasses: 'text-xs font-medium (Segments size=sm)',
    currentExampleClasses: 'text-xs font-medium text-stone-600',
    exampleTextKey: 'examples.misc.segmentOption',
    usedIn: [{ path: 'components/Segments.tsx', noteKey: 'usedInNotes.segmentsSm' }],
    decision: 'keep',
  },
  {
    key: 'formErrorToken',
    currentLabelKey: 'rows.formErrorToken.label',
    currentClasses: 'text-sm text-palette-danger',
    currentExampleClasses: 'text-sm text-palette-danger',
    exampleTextKey: 'examples.forms.error',
    usedIn: [{ path: 'lib/formStyles.ts', noteKey: 'usedInNotes.formErrorMessageClasses' }],
    decision: 'keep',
  },
  {
    key: 'landingKpiValue',
    currentLabelKey: 'rows.landingKpiValue.label',
    currentClasses: 'text-3xl font-bold text-palette-forest-dark',
    currentExampleClasses: 'text-3xl font-bold text-palette-forest-dark',
    exampleTextKey: 'examples.misc.kpi',
    usedIn: [{ path: 'app/[locale]/page.tsx', noteKey: 'usedInNotes.landingStats' }],
    decision: 'keep',
  },
  {
    key: 'landingLead',
    currentLabelKey: 'rows.landingLead.label',
    currentClasses: 'text-xl leading-relaxed text-stone-600',
    currentExampleClasses: 'text-xl leading-relaxed text-stone-600',
    exampleTextKey: 'examples.misc.lead',
    usedIn: [{ path: 'app/[locale]/page.tsx' }],
    decision: 'keep',
  },
  {
    key: 'secondaryMuted',
    currentLabelKey: 'rows.secondaryMuted.label',
    currentClasses: 'text-sm text-stone-400',
    currentExampleClasses: 'text-sm text-stone-400',
    exampleTextKey: 'examples.misc.muted',
    usedIn: [{ path: 'components/LoginForm.tsx' }, { path: 'app/[locale]/login/page.tsx' }, { path: 'app/[locale]/reset-password/ResetPasswordForm.tsx' }],
    decision: 'keep',
  },
  {
    key: 'inlineLinkUnderline',
    currentLabelKey: 'rows.inlineLinkUnderline.label',
    currentClasses: 'underline text-palette-forest-dark (inline button/link)',
    currentExampleClasses: 'text-sm underline text-palette-forest-dark',
    exampleTextKey: 'examples.actions.inlineLink',
    usedIn: [{ path: 'components/LoginForm.tsx' }],
    decision: 'keep',
  },
  {
    key: 'microUpper9',
    currentLabelKey: 'rows.microUpper9.label',
    currentClasses: 'text-[9px] font-bold uppercase (strava/calendar/date blocks)',
    currentExampleClasses: 'text-[9px] font-bold uppercase tracking-wider text-stone-400',
    exampleTextKey: 'examples.misc.microLabel',
    usedIn: [{ path: 'components/CalendarView.tsx' }, { path: 'app/[locale]/dashboard/PendingRequestTile.tsx' }, { path: 'app/[locale]/dashboard/AthleteSentRequestDetailModal.tsx' }],
    decision: 'replace',
    replacementKey: 'proposed.microUpper',
  },
  {
    key: 'datePickerWeekday',
    currentLabelKey: 'rows.datePickerWeekday.label',
    currentClasses: 'text-[11px] font-medium text-stone-500',
    currentExampleClasses: 'text-[11px] font-medium text-stone-500',
    exampleTextKey: 'examples.calendar.weekday',
    usedIn: [{ path: 'components/DatePickerPopup.tsx' }],
    decision: 'keep',
  },
  {
    key: 'formLabel',
    currentLabelKey: 'rows.formLabel.label',
    currentClasses: 'text-sm font-medium text-stone-700',
    currentExampleClasses: 'text-sm font-medium text-stone-700',
    exampleTextKey: 'examples.forms.label',
    usedIn: [{ path: 'lib/formStyles.ts', noteKey: 'usedInNotes.formLabelClasses' }, { path: 'components/Input.tsx' }, { path: 'components/Textarea.tsx' }],
    decision: 'keep',
  },
  {
    key: 'formInputText',
    currentLabelKey: 'rows.formInputText.label',
    currentClasses: 'text-sm',
    currentExampleClasses: 'text-sm text-stone-900',
    exampleTextKey: 'examples.forms.value',
    usedIn: [{ path: 'lib/formStyles.ts', noteKey: 'usedInNotes.formInputTextSize' }],
    decision: 'keep',
  },
  {
    key: 'formErrorHardRed',
    currentLabelKey: 'rows.formErrorHardRed.label',
    currentClasses: 'text-sm text-palette-danger-dark',
    currentExampleClasses: 'text-sm text-palette-danger-dark',
    exampleTextKey: 'examples.forms.error',
    usedIn: [{ path: 'components/LoginForm.tsx' }, { path: 'app/[locale]/login/page.tsx' }],
    decision: 'replace',
    replacementKey: 'proposed.feedbackError',
  },
] as const

const PROPOSED: Record<string, { labelKey: string; classes: string }> = {
  titleCard: {
    labelKey: 'proposed.titleCard.label',
    classes: 'text-sm font-semibold text-stone-900',
  },
  metaInline: {
    labelKey: 'proposed.metaInline.label',
    classes: 'text-xs text-stone-500',
  },
  microUpper: {
    labelKey: 'proposed.microUpper.label',
    classes: 'text-[10px] font-semibold uppercase tracking-wider',
  },
  feedbackError: {
    labelKey: 'proposed.feedbackError.label',
    classes: 'text-sm text-palette-danger',
  },
  microBadge: {
    labelKey: 'proposed.microBadge.label',
    classes: 'text-[10px] font-bold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded',
  },
  microStatus: {
    labelKey: 'proposed.microStatus.label',
    classes: 'text-[10px] font-medium text-stone-500',
  },
}

export async function TypographyTable() {
  const t = await getTranslations('adminDesignSystem.typography')

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky top-0 z-10 bg-stone-50 text-left text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200 px-4 py-3">
              {t('columns.style')}
            </th>
            <th className="sticky top-0 z-10 bg-stone-50 text-left text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200 px-4 py-3">
              {t('columns.currentClasses')}
            </th>
            <th className="sticky top-0 z-10 bg-stone-50 text-left text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200 px-4 py-3">
              {t('columns.example')}
            </th>
            <th className="sticky top-0 z-10 bg-stone-50 text-left text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200 px-4 py-3">
              {t('columns.usedIn')}
            </th>
            <th className="sticky top-0 z-10 bg-stone-50 text-left text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200 px-4 py-3">
              {t('columns.decision')}
            </th>
            <th className="sticky top-0 z-10 bg-stone-50 text-left text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200 px-4 py-3">
              {t('columns.replacement')}
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const replacement = row.replacementKey ? PROPOSED[row.replacementKey.replace('proposed.', '')] : undefined
            return (
              <tr key={row.key} className="border-b border-stone-100">
                <td className="align-top px-4 py-3">
                  <div className="text-sm font-semibold text-stone-900">{t(row.currentLabelKey)}</div>
                </td>
                <td className="align-top px-4 py-3">
                  <code className="text-xs font-mono text-stone-700">{row.currentClasses}</code>
                </td>
                <td className="align-top px-4 py-3">
                  <div className="rounded-lg border border-stone-200 bg-white px-3 py-2">
                    <div className={row.currentExampleClasses}>{t(row.exampleTextKey)}</div>
                  </div>
                </td>
                <td className="align-top px-4 py-3">
                  <ul className="space-y-1">
                    {row.usedIn.map((item) => (
                      <li key={`${item.path}|${item.noteKey ?? ''}`} className="text-xs text-stone-600">
                        <code className="font-mono text-stone-700">{item.path}</code>
                        {item.noteKey && (
                          <span className="text-stone-500"> {t(item.noteKey)}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="align-top px-4 py-3">
                  {row.decision === 'keep' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-palette-forest-dark/10 text-palette-forest-dark border border-palette-forest-dark/20">
                      {t('decisions.keep')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white text-palette-amber border border-palette-amber">
                      {t('decisions.replace')}
                    </span>
                  )}
                </td>
                <td className="align-top px-4 py-3">
                  {row.decision === 'replace' && row.replacementKey && replacement ? (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-stone-900">{t(replacement.labelKey)}</div>
                        <code className="text-xs font-mono text-stone-700">{replacement.classes}</code>
                      </div>
                      <div className="rounded-lg border border-stone-200 bg-white px-3 py-2">
                        <div className={replacement.classes}>{t(row.exampleTextKey)}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-stone-400">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

