import { collectMessageKeys } from '@/lib/i18n/collectMessageKeys'

export type ArrayLengthMismatch = {
  key: string
  frLength: number
  enLength: number
}

export type MessageParityDiff = {
  onlyInFr: string[]
  onlyInEn: string[]
  arrayLengthMismatch: ArrayLengthMismatch[]
}

export function assertMessageParity(fr: unknown, en: unknown): MessageParityDiff {
  const frInfo = collectMessageKeys(fr)
  const enInfo = collectMessageKeys(en)

  const onlyInFr = [...frInfo.keys].filter((key) => !enInfo.keys.has(key)).sort()
  const onlyInEn = [...enInfo.keys].filter((key) => !frInfo.keys.has(key)).sort()

  const arrayLengthMismatch: ArrayLengthMismatch[] = []
  for (const key of frInfo.keys) {
    if (!enInfo.keys.has(key)) continue

    const frLength = frInfo.arrayLengths.get(key)
    const enLength = enInfo.arrayLengths.get(key)
    if (frLength === undefined && enLength === undefined) continue
    if (frLength === enLength) continue

    arrayLengthMismatch.push({
      key,
      frLength: frLength ?? 0,
      enLength: enLength ?? 0,
    })
  }

  arrayLengthMismatch.sort((a, b) => a.key.localeCompare(b.key))

  return { onlyInFr, onlyInEn, arrayLengthMismatch }
}

export function formatMessageParityDiff(diff: MessageParityDiff): string {
  const lines: string[] = []

  if (diff.onlyInFr.length > 0) {
    lines.push(`Keys only in fr.json (${diff.onlyInFr.length}):`)
    lines.push(...diff.onlyInFr.map((key) => `  - ${key}`))
  }

  if (diff.onlyInEn.length > 0) {
    lines.push(`Keys only in en.json (${diff.onlyInEn.length}):`)
    lines.push(...diff.onlyInEn.map((key) => `  - ${key}`))
  }

  if (diff.arrayLengthMismatch.length > 0) {
    lines.push(`Array length mismatches (${diff.arrayLengthMismatch.length}):`)
    lines.push(
      ...diff.arrayLengthMismatch.map(
        ({ key, frLength, enLength }) => `  - ${key}: fr=${frLength}, en=${enLength}`
      )
    )
  }

  return lines.join('\n')
}

export function hasMessageParityDiff(diff: MessageParityDiff): boolean {
  return (
    diff.onlyInFr.length > 0 ||
    diff.onlyInEn.length > 0 ||
    diff.arrayLengthMismatch.length > 0
  )
}
