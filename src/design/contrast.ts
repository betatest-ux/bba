/**
 * WCAG 2.x contrast maths — used at save time to validate admin-selected
 * accent colours, and in tests to prove every palette combination passes AA.
 */

const channel = (hex: string, index: number): number =>
  parseInt(hex.replace('#', '').slice(index * 2, index * 2 + 2), 16) / 255

const linearise = (value: number): number =>
  value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)

export const relativeLuminance = (hex: string): number => {
  const [r, g, b] = [0, 1, 2].map((i) => linearise(channel(hex, i)))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export const contrastRatio = (hexA: string, hexB: string): number => {
  const [light, dark] = [relativeLuminance(hexA), relativeLuminance(hexB)].sort((a, b) => b - a)
  return (light + 0.05) / (dark + 0.05)
}

export const passesAA = (foreground: string, background: string, largeText = false): boolean =>
  contrastRatio(foreground, background) >= (largeText ? 3 : 4.5)
