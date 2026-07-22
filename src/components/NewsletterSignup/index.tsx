'use client'

import React, { useState, useTransition } from 'react'

import { subscribeToNewsletter, type NewsletterActionResult } from '@/newsletter/actions'
import { cn } from '@/utilities/ui'

/**
 * Compact newsletter signup (double opt-in: submitting sends a confirmation
 * email). The footer variant is styled for the dark loom background.
 */
export const NewsletterSignup: React.FC<{ variant?: 'card' | 'footer' }> = ({
  variant = 'card',
}) => {
  const [result, setResult] = useState<NewsletterActionResult | null>(null)
  const [isPending, startTransition] = useTransition()

  const onFooter = variant === 'footer'

  if (result?.ok) {
    return (
      <p
        aria-live="polite"
        className={cn('font-medium', onFooter ? 'text-white' : 'text-success')}
        role="status"
      >
        ✓ Nearly there — check your inbox to confirm.
      </p>
    )
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        startTransition(async () => {
          setResult(await subscribeToNewsletter(null, formData))
        })
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`newsletter-email-${variant}`}>
          Email address
        </label>
        <input
          className={cn(
            'h-11 flex-1 rounded-full border px-4',
            onFooter
              ? 'border-white/25 bg-white/10 text-white placeholder:text-white/60'
              : 'border-input bg-card',
          )}
          id={`newsletter-email-${variant}`}
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <button
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 font-semibold text-brand-on transition-transform duration-150 hover:scale-[1.03] disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? 'Signing up…' : 'Sign up'}
        </button>
      </div>

      {/* Honeypot */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`newsletter-website-${variant}`}>Leave this empty</label>
        <input
          autoComplete="off"
          id={`newsletter-website-${variant}`}
          name="website"
          tabIndex={-1}
          type="text"
        />
      </div>

      <label
        className={cn(
          'flex cursor-pointer items-start gap-2 text-sm',
          onFooter ? 'text-white/80' : 'text-muted-foreground',
        )}
        htmlFor={`newsletter-consent-${variant}`}
      >
        <input
          className="mt-0.5 h-4 w-4 shrink-0 accent-(--bb-accent)"
          id={`newsletter-consent-${variant}`}
          name="consent"
          required
          type="checkbox"
        />
        <span>I’m happy to receive the newsletter — unsubscribe any time.</span>
      </label>

      {result && !result.ok && (
        <p
          aria-live="polite"
          className={cn('text-sm font-medium', onFooter ? 'text-white' : 'text-error')}
          role="alert"
        >
          {result.message}
        </p>
      )}
    </form>
  )
}
