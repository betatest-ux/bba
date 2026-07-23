/**
 * `pnpm db:init` — creates/updates the database schema (dev-mode push).
 *
 * Used as part of the Vercel build command (`pnpm db:init && pnpm build`) so
 * a fresh Neon database gets its tables without any local tooling. Safe to
 * run repeatedly: it only applies schema differences.
 *
 * Note for later: once the schema is stable in production, the more
 * conservative workflow is `payload migrate` (see README → Database story).
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const run = async (): Promise<void> => {
  const payload = await getPayload({ config })
  payload.logger.info('Database schema is in sync.')
  process.exit(0)
}

void run()
