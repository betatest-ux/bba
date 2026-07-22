import { describe, expect, it } from 'vitest'

import { contrastRatio, passesAA } from '@/design/contrast'
import { accentOptions, palette, surfaces } from '@/design/tokens'

describe('WCAG contrast maths', () => {
  it('computes the canonical black/white ratio', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0)
  })

  it('is symmetric', () => {
    expect(contrastRatio('#123456', '#FEDCBA')).toBeCloseTo(contrastRatio('#FEDCBA', '#123456'), 5)
  })
})

describe('every admin-selectable accent passes WCAG AA', () => {
  for (const [key, option] of Object.entries(accentOptions)) {
    it(`${key} — accent as text on the light surface`, () => {
      expect(passesAA(option.light.accent, surfaces.light)).toBe(true)
    })
    it(`${key} — button text on the accent (light mode)`, () => {
      expect(passesAA(option.light.on, option.light.accent)).toBe(true)
    })
    it(`${key} — accent as text on the dark surface`, () => {
      expect(passesAA(option.dark.accent, surfaces.dark)).toBe(true)
    })
    it(`${key} — button text on the accent (dark mode)`, () => {
      expect(passesAA(option.dark.on, option.dark.accent)).toBe(true)
    })
  }
})

describe('core palette', () => {
  it('body text passes AAA on the light surface', () => {
    expect(contrastRatio(palette.soot, palette.cotton)).toBeGreaterThan(7)
  })

  it('festival gold correctly FAILS on light — which is why it is decorative only', () => {
    expect(passesAA(palette.gold, palette.cotton)).toBe(false)
  })
})
