import Image from 'next/image'
import type { LandingScreenshotId } from '@/lib/landingConfig'
import { getLandingScreenshotSrc } from '@/lib/landingScreenshots'

type LandingScreenshotFrameProps = {
  locale: string
  screenshotId: LandingScreenshotId
  alt: string
  priority?: boolean
  className?: string
  imageClassName?: string
  sizes?: string
  aspectClassName?: string
}

export function LandingScreenshotFrame({
  locale,
  screenshotId,
  alt,
  priority = false,
  className = '',
  imageClassName = 'object-cover object-top',
  sizes = '(max-width: 1024px) 100vw, 50vw',
  aspectClassName = 'relative w-full',
}: LandingScreenshotFrameProps) {
  const src = getLandingScreenshotSrc(locale, screenshotId)

  return (
    <div
      className={`overflow-hidden rounded-xl border border-stone-200 bg-white p-1 shadow-lg ${className}`.trim()}
    >
      <div className={aspectClassName}>
        <Image
          src={src}
          alt={alt}
          width={1600}
          height={1000}
          priority={priority}
          sizes={sizes}
          className={`w-full rounded-lg ${imageClassName}`.trim()}
        />
      </div>
    </div>
  )
}
