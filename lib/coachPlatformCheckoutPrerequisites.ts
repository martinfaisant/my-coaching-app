import { isCanadianProvinceCode } from '@/lib/canadianProvinces'
import type { CoachBillingAddressFields } from '@/lib/stripeCoachPlatformBillingAddress'

export function emptyCoachBillingAddressFields(): CoachBillingAddressFields {
  return {
    line1: '',
    line2: '',
    city: '',
    postalCode: '',
    provinceCode: '',
  }
}

export function normalizeCoachBillingAddressFields(
  f: CoachBillingAddressFields | null | undefined
): CoachBillingAddressFields {
  if (!f) return emptyCoachBillingAddressFields()
  return {
    line1: f.line1 ?? '',
    line2: f.line2 ?? '',
    city: f.city ?? '',
    postalCode: f.postalCode ?? '',
    provinceCode: f.provinceCode ?? '',
  }
}

export function isCoachProfileNameComplete(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): boolean {
  const f = typeof firstName === 'string' ? firstName.trim() : ''
  const l = typeof lastName === 'string' ? lastName.trim() : ''
  return f.length > 0 && l.length > 0
}

export function isCoachBillingAddressComplete(fields: CoachBillingAddressFields | null | undefined): boolean {
  const n = normalizeCoachBillingAddressFields(fields)
  return (
    n.line1.trim().length > 0 &&
    n.city.trim().length > 0 &&
    n.postalCode.trim().length > 0 &&
    isCanadianProvinceCode(n.provinceCode.trim().toUpperCase())
  )
}

export function areCoachPlatformCheckoutPrerequisitesMet(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  billingFields: CoachBillingAddressFields | null | undefined
): boolean {
  return isCoachProfileNameComplete(firstName, lastName) && isCoachBillingAddressComplete(billingFields)
}

export type CoachPlatformCheckoutPrerequisitesSnapshot = {
  firstName: string
  lastName: string
  billingFields: CoachBillingAddressFields
  billingLoadError: boolean
}

export function buildCoachPlatformCheckoutPrerequisitesSnapshot(params: {
  firstName: string | null | undefined
  lastName: string | null | undefined
  billingFields: CoachBillingAddressFields | null | undefined
  billingLoadError: boolean
}): CoachPlatformCheckoutPrerequisitesSnapshot {
  return {
    firstName: typeof params.firstName === 'string' ? params.firstName : '',
    lastName: typeof params.lastName === 'string' ? params.lastName : '',
    billingFields: normalizeCoachBillingAddressFields(params.billingFields),
    billingLoadError: params.billingLoadError,
  }
}
