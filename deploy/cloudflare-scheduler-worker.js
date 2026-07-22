/**
 * Cloudflare Worker: fires Payload's scheduled-publish job queue.
 *
 * Vercel's free (Hobby) plan only allows daily crons, so this free Worker
 * provides minute-level scheduling instead.
 *
 * Setup (Cloudflare dashboard → Workers & Pages → Create Worker):
 *  1. Paste this file as the Worker code.
 *  2. Settings → Variables → add a secret named CRON_SECRET with the same
 *     value as the CRON_SECRET env var on Vercel.
 *  3. Settings → Triggers → Cron Triggers → add:  *\/5 * * * *
 *     (every 5 minutes — well within the free tier).
 */

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      fetch('https://bballiance.org.uk/api/payload-jobs/run', {
        headers: {
          Authorization: `Bearer ${env.CRON_SECRET}`,
        },
        method: 'GET',
      }),
    )
  },
}
