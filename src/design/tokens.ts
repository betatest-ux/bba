/**
 * BBAlliance design tokens — the single source of truth for the palette.
 * Mirrored as CSS custom properties in src/app/(frontend)/globals.css.
 * See DESIGN.md for the rationale.
 */

export const palette = {
  loom: '#1F3A5F', // Loom Indigo — primary brand
  brick: '#9E3B32', // Mill Brick — default accent
  moor: '#3D6B50', // Moor Green — secondary accent
  gold: '#D98E32', // Festival Gold — decorative only (fails AA on light)
  cotton: '#F6F2EA', // light page background
  cotton2: '#ECE6D9', // raised light surface
  soot: '#191E24', // dark page background / text on light
  soot2: '#232A33', // raised dark surface
} as const

export type AccentKey = 'brick' | 'loom' | 'moor'

/**
 * The curated accent options admins may pick in Appearance. Each ships as a
 * complete, pre-validated trio for light mode plus a lifted variant for dark
 * mode. `on` is the text colour used ON the accent (buttons); `soft` is a
 * tint used for washes/badges.
 */
export const accentOptions: Record<
  AccentKey,
  {
    dark: { accent: string; on: string; soft: string }
    label: string
    light: { accent: string; on: string; soft: string }
  }
> = {
  brick: {
    label: 'Mill Brick (warm red)',
    light: { accent: '#9E3B32', on: '#FFFFFF', soft: '#F3E1DE' },
    dark: { accent: '#D98A82', on: '#191E24', soft: '#3A2724' },
  },
  loom: {
    label: 'Loom Indigo (deep blue)',
    light: { accent: '#1F3A5F', on: '#FFFFFF', soft: '#DFE6EF' },
    dark: { accent: '#93B4DC', on: '#191E24', soft: '#25313F' },
  },
  moor: {
    label: 'Moor Green',
    light: { accent: '#3D6B50', on: '#FFFFFF', soft: '#DFEAE3' },
    dark: { accent: '#8FBEA1', on: '#191E24', soft: '#243329' },
  },
}

/** Site surface colours each accent must stay legible against. */
export const surfaces = {
  dark: palette.soot,
  light: palette.cotton,
} as const

export const DEFAULT_ACCENT: AccentKey = 'brick'
