import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function GET(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get('token')

  if (!token || token.length < 16) {
    return Response.redirect(new URL('/newsletter/invalid', request.url), 302)
  }

  const payload = await getPayload({ config: configPromise })

  try {
    const subscribers = await payload.find({
      collection: 'newsletter-subscribers',
      limit: 1,
      where: { unsubscribeToken: { equals: token } },
    })
    const subscriber = subscribers.docs[0]
    if (!subscriber) {
      return Response.redirect(new URL('/newsletter/invalid', request.url), 302)
    }

    // Data minimisation (UK GDPR): remove the record entirely.
    await payload.delete({
      collection: 'newsletter-subscribers',
      id: subscriber.id,
    })

    return Response.redirect(new URL('/newsletter/goodbye', request.url), 302)
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Newsletter unsubscribe failed' })
    return Response.redirect(new URL('/newsletter/invalid', request.url), 302)
  }
}
