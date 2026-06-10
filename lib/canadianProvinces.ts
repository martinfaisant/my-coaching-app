/** Codes ISO 3166-2 province/territoire (Canada) — alignés sur Stripe Customer.address.state */
export const CANADIAN_PROVINCE_CODES = [
  'AB',
  'BC',
  'MB',
  'NB',
  'NL',
  'NS',
  'NT',
  'NU',
  'ON',
  'PE',
  'QC',
  'SK',
  'YT',
] as const

export type CanadianProvinceCode = (typeof CANADIAN_PROVINCE_CODES)[number]

const CODE_SET = new Set<string>(CANADIAN_PROVINCE_CODES)

export function isCanadianProvinceCode(value: string | null | undefined): value is CanadianProvinceCode {
  return typeof value === 'string' && CODE_SET.has(value.trim().toUpperCase())
}
