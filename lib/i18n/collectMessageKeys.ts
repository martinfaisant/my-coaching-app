export type MessageKeyInfo = {
  keys: Set<string>
  arrayLengths: Map<string, number>
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function collectMessageKeys(obj: unknown, prefix = ''): MessageKeyInfo {
  const keys = new Set<string>()
  const arrayLengths = new Map<string, number>()

  if (Array.isArray(obj)) {
    if (prefix) {
      keys.add(prefix)
      arrayLengths.set(prefix, obj.length)
    }
    return { keys, arrayLengths }
  }

  if (!isPlainObject(obj)) {
    if (prefix) keys.add(prefix)
    return { keys, arrayLengths }
  }

  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    const value = obj[key]

    if (isPlainObject(value)) {
      const nested = collectMessageKeys(value, path)
      nested.keys.forEach((nestedKey) => keys.add(nestedKey))
      nested.arrayLengths.forEach((length, nestedKey) => arrayLengths.set(nestedKey, length))
      continue
    }

    keys.add(path)
    if (Array.isArray(value)) {
      arrayLengths.set(path, value.length)
    }
  }

  return { keys, arrayLengths }
}
