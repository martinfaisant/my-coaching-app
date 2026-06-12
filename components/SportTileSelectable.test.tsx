import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'

import { SportTileSelectable } from '@/components/SportTileSelectable'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const sports: Record<string, string> = {
      course: 'Course',
      velo: 'Vélo',
      trail: 'Trail',
    }
    return sports[key] ?? key
  },
}))

function getSportTileSurface(label: string): HTMLElement {
  const span = screen.getByText(label)
  const surface = span.closest('div.rounded-full')
  if (!(surface instanceof HTMLElement)) {
    throw new Error(`Surface de tuile introuvable pour « ${label} »`)
  }
  return surface
}

function expectTileVisuallySelected(surface: HTMLElement, selected: boolean) {
  if (selected) {
    expect(surface.className).toContain('bg-palette-forest-dark')
    expect(surface.className).toContain('text-white')
  } else {
    expect(surface.className).toContain('bg-white')
    expect(surface.className).not.toContain('bg-palette-forest-dark')
  }
}

function getCheckbox(value: string, name = 'coached_sports'): HTMLInputElement {
  const input = document.querySelector(`input[type="checkbox"][name="${name}"][value="${value}"]`)
  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`Checkbox introuvable pour ${name}=${value}`)
  }
  return input
}

/** Reproduit la logique d’état du profil coach (ProfileForm). */
function CoachedSportsSelectionHarness({ initialSports }: { initialSports: string[] }) {
  const [selectedCoachedSports, setSelectedCoachedSports] = useState(() => [...initialSports].sort())

  return (
    <>
      {(['velo', 'course'] as const).map((value) => (
        <SportTileSelectable
          key={value}
          value={value}
          name="coached_sports"
          checked={selectedCoachedSports.includes(value)}
          onChange={(checked) => {
            setSelectedCoachedSports((prev) =>
              checked ? [...prev, value].sort() : prev.filter((s) => s !== value)
            )
          }}
        />
      ))}
    </>
  )
}

describe('SportTileSelectable', () => {
  describe('mode contrôlé (checked + onChange)', () => {
    it('affiche la tuile sélectionnée quand checked=true', () => {
      render(
        <SportTileSelectable
          name="coached_sports"
          value="velo"
          checked
          onChange={vi.fn()}
        />
      )

      expectTileVisuallySelected(getSportTileSurface('Vélo'), true)
      expect(getCheckbox('velo').checked).toBe(true)
    })

    it('affiche la tuile non sélectionnée quand checked=false', () => {
      render(
        <SportTileSelectable
          name="coached_sports"
          value="velo"
          checked={false}
          onChange={vi.fn()}
        />
      )

      expectTileVisuallySelected(getSportTileSurface('Vélo'), false)
      expect(getCheckbox('velo').checked).toBe(false)
    })

    it('appelle onChange(false) au clic sur une tuile déjà sélectionnée', () => {
      const onChange = vi.fn()
      render(
        <SportTileSelectable
          name="coached_sports"
          value="velo"
          checked
          onChange={onChange}
        />
      )

      fireEvent.click(getCheckbox('velo'))

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(false)
    })

    it('met à jour le style visuel après décochage (parent contrôlé)', () => {
      render(<CoachedSportsSelectionHarness initialSports={['velo']} />)

      const surface = getSportTileSurface('Vélo')
      expectTileVisuallySelected(surface, true)

      fireEvent.click(getCheckbox('velo'))

      expectTileVisuallySelected(getSportTileSurface('Vélo'), false)
      expect(getCheckbox('velo').checked).toBe(false)
    })

    it('met à jour le style visuel après sélection (parent contrôlé)', () => {
      render(<CoachedSportsSelectionHarness initialSports={[]} />)

      expectTileVisuallySelected(getSportTileSurface('Vélo'), false)

      fireEvent.click(getCheckbox('velo'))

      expectTileVisuallySelected(getSportTileSurface('Vélo'), true)
      expect(getCheckbox('velo').checked).toBe(true)
    })
  })

  describe('mode non contrôlé (defaultChecked)', () => {
    it('conserve le style sélectionné après décochage — limite connue du mode non contrôlé', () => {
      render(<SportTileSelectable name="coached_sports" value="velo" defaultChecked />)

      const surface = getSportTileSurface('Vélo')
      expectTileVisuallySelected(surface, true)

      fireEvent.click(getCheckbox('velo'))

      expect(getCheckbox('velo').checked).toBe(false)
      expectTileVisuallySelected(surface, true)
    })
  })
})
