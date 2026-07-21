/**
 * Small in-memory sliding-window rate limiter for public form endpoints.
 * Per-instance (resets on deploy/restart) — enough to blunt bots and abuse on
 * a charity site without extra infrastructure. Pair with the honeypot field.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

const MAX_BUCKETS = 5000

export const rateLimit = (
  key: string,
  { max = 5, windowMs = 10 * 60 * 1000 }: { max?: number; windowMs?: number } = {},
): { ok: boolean; retryAfterSeconds: number } => {
  const now = Date.now()

  // Opportunistic cleanup so the map can't grow unbounded.
  if (buckets.size > MAX_BUCKETS) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(bucketKey)
    }
  }

  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterSeconds: 0 }
  }

  bucket.count += 1
  if (bucket.count > max) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  return { ok: true, retryAfterSeconds: 0 }
}
