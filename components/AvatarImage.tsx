'use client'

import { useState } from 'react'
import { Avatar } from './Avatar'

type AvatarImageProps = {
  src: string | null | undefined
  initials: string
  alt?: string
  className?: string
}

export function AvatarImage({ src, initials, alt = 'Avatar', className = 'w-16 h-16' }: AvatarImageProps) {
  const [imageError, setImageError] = useState(false)
  const hasValidSrc = src && src.trim() && !imageError

  if (!hasValidSrc) {
    return <Avatar initials={initials} className={className} />
  }

  return (
    <img
      src={src!}
      alt={alt}
      className={`${className} rounded-xl object-cover bg-stone-200`}
      onError={() => setImageError(true)}
    />
  )
}
