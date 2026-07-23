import { createLocalReq, getPayload } from 'payload'
import { runSeedStage, seed, type SeedState } from '@/endpoints/seed'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

// The admin SeedButton drives the seed one stage per request, so each
// invocation stays well under serverless time limits — but keep headroom for
// slow databases and object storage. (A body-less POST still runs the whole
// seed in one go for environments without limits.)
export const maxDuration = 300

export async function POST(request: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Authenticate by passing request headers
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return new Response('Action forbidden.', { status: 403 })
  }

  if (!(user.roles || []).includes('admin')) {
    // Bootstrap escape hatch: older versions could leave a site whose only
    // account is a non-admin. If no admin exists at all, let any signed-in
    // user seed (the seed creates the demo admin accounts); otherwise
    // seeding is admin-only.
    const admins = await payload.count({
      collection: 'users',
      where: { roles: { contains: 'admin' } },
    })
    if (admins.totalDocs > 0) {
      return new Response('Action forbidden — ask an admin to run the seed.', { status: 403 })
    }
  }

  let body: { stage?: string; state?: Partial<SeedState> | null } = {}
  try {
    body = await request.json()
  } catch {
    // No/invalid JSON body → full run below.
  }

  try {
    if (body.stage) {
      const { nextStage, state } = await runSeedStage({
        payload,
        stageKey: body.stage,
        state: body.state,
      })
      if (nextStage === null) {
        // Seeding suppresses per-document revalidation, so statically
        // prerendered pages (often built against an empty database) would
        // keep serving stale content — refresh everything in one go.
        revalidatePath('/', 'layout')
      }
      return Response.json({ success: true, nextStage, state })
    }

    // Create a Payload request object to pass to the Local API for transactions
    const payloadReq = await createLocalReq({ user }, payload)
    await seed({ payload, req: payloadReq })
    revalidatePath('/', 'layout')

    return Response.json({ success: true })
  } catch (e) {
    payload.logger.error({ err: e, message: `Error seeding data (stage: ${body.stage || 'all'})` })
    // The caller is an authenticated admin — return the real error so the
    // panel can show something more useful than "an error occurred".
    const message = e instanceof Error ? e.message : String(e)
    return Response.json({ error: message, stage: body.stage || null }, { status: 500 })
  }
}
