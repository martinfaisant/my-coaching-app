import type { Metadata } from 'next'
import { NOINDEX_METADATA } from '@/lib/seoRobots'

export async function generateMetadata(): Promise<Metadata> {
  return NOINDEX_METADATA
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
