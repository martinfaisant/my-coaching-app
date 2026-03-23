
import type { TileCardBorderColor } from '@/components/TileCard'

export function getGoalColor(isPrimary: boolean, isResult: boolean): TileCardBorderColor {
  if (isResult) return 'stone'
  return isPrimary ? 'forest' : 'amber'
}

export function getGoalBadgeClass(isPrimary: boolean): string {

  return isPrimary ? 'bg-white text-palette-forest-dark border-palette-forest-dark' : 'bg-white text-palette-amber border-palette-amber'
  }