/**
 * `pnpm seed` — populates the site with realistic BBAlliance placeholder
 * content so every page looks finished on first run.
 *
 * Every invented fact is marked [PLACEHOLDER — replace].
 * Safe to re-run: it clears content collections first (users are kept).
 */
import config from '@payload-config'
import { createLocalReq, getPayload } from 'payload'

import { seed } from '@/endpoints/seed'

const run = async (): Promise<void> => {
  const payload = await getPayload({ config })
  const req = await createLocalReq({}, payload)

  await seed({ payload, req })

  payload.logger.info('Seed complete.')
  process.exit(0)
}

void run()
