'use client'

import React, { Fragment, useCallback, useState } from 'react'
import { toast } from '@payloadcms/ui'

import { seedStageList } from '@/endpoints/seed/stages'

import './index.scss'

const SuccessMessage: React.FC = () => (
  <div>
    Database seeded! You can now{' '}
    <a target="_blank" href="/">
      visit your website
    </a>
  </div>
)

export const SeedButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()

      if (seeded) {
        toast.info('Database already seeded.')
        return
      }
      if (loading) {
        toast.info('Seeding already in progress.')
        return
      }

      setLoading(true)
      const toastId = toast.loading('Seeding with data…')

      try {
        // One request per stage: a single request doing everything would hit
        // serverless time limits (Vercel kills long-running functions).
        let state: unknown = null
        for (let i = 0; i < seedStageList.length; i++) {
          const stage = seedStageList[i]
          toast.loading(`Seeding ${i + 1}/${seedStageList.length}: ${stage.label}…`, {
            id: toastId,
          })

          const res = await fetch('/next/seed', {
            body: JSON.stringify({ stage: stage.key, state }),
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          })
          const json = await res.json().catch(() => null)

          if (!res.ok) {
            const detail =
              (json && typeof json.error === 'string' && json.error) || `HTTP ${res.status}`
            throw new Error(`failed at “${stage.label}” — ${detail}`)
          }

          state = json?.state ?? state
        }

        setSeeded(true)
        toast.success(<SuccessMessage />, { duration: 10000, id: toastId })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        toast.error(`Seeding ${message}. It is safe to click the button to try again.`, {
          duration: 20000,
          id: toastId,
        })
      } finally {
        setLoading(false)
      }
    },
    [loading, seeded],
  )

  let message = ''
  if (loading) message = ' (seeding…)'
  if (seeded) message = ' (done!)'

  return (
    <Fragment>
      <button className="seedButton" disabled={loading} onClick={handleClick}>
        Seed your database
      </button>
      {message}
    </Fragment>
  )
}
