/**
 * `pnpm generate:placeholders` — renders the seed's placeholder images to
 * src/endpoints/seed/assets/*.webp, which are committed to the repo.
 *
 * The seed uploads these finished files instead of rendering SVGs at runtime:
 * the SVG labels need system fonts, and serverless containers (Vercel) have
 * none, so runtime rendering there can crash the whole function. Re-run this
 * (on a machine with fonts, i.e. any dev machine) after changing `imageDefs`.
 */
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

import { imageDefs } from '@/endpoints/seed'
import { makePlaceholderImage } from '@/endpoints/seed/helpers'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.resolve(dirname, '../endpoints/seed/assets')

const run = async (): Promise<void> => {
  await fs.mkdir(assetsDir, { recursive: true })
  for (const [key, [label, width, height, tone]] of Object.entries(imageDefs)) {
    const file = await makePlaceholderImage(label, width, height, tone)
    const target = path.join(assetsDir, `${key}.webp`)
    await fs.writeFile(target, file.data)
    console.log(`${key}.webp — ${width}×${height}, ${(file.size / 1024).toFixed(1)} KiB`)
  }
  console.log(`\nWrote ${Object.keys(imageDefs).length} placeholder images to ${assetsDir}`)
}

void run()
