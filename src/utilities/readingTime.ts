import { lexicalToPlainText } from './lexicalToPlainText'

/** Estimated reading time in whole minutes (200 wpm, minimum 1). */
export const readingTime = (lexicalData: unknown): number => {
  const words = lexicalToPlainText(lexicalData).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
