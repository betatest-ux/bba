'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import React, { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'

import {
  CONTACT_SUBJECTS,
  contactSchema,
  contactSubjectLabels,
  type ContactFormValues,
} from '@/forms/contactSchema'
import { cn } from '@/utilities/ui'
import { submitContactForm, type ContactActionResult } from './actions'

const inputStyles =
  'w-full rounded-xl border border-input bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-3 focus-visible:outline-brand min-h-11'

const Field: React.FC<{
  children: React.ReactNode
  error?: string
  hint?: string
  htmlFor: string
  label: string
  required?: boolean
}> = ({ children, error, hint, htmlFor, label, required }) => (
  <div>
    <label className="mb-1.5 block font-medium" htmlFor={htmlFor}>
      {label}
      {required ? (
        <span aria-hidden className="text-brand">
          {' '}
          *
        </span>
      ) : (
        <span className="text-sm font-normal text-muted-foreground"> (optional)</span>
      )}
    </label>
    {hint && (
      <p className="mb-1.5 text-sm text-muted-foreground" id={`${htmlFor}-hint`}>
        {hint}
      </p>
    )}
    {children}
    {error && (
      <p className="mt-1.5 text-sm font-medium text-error" id={`${htmlFor}-error`} role="alert">
        {error}
      </p>
    )}
  </div>
)

export const ContactForm: React.FC = () => {
  const [serverResult, setServerResult] = useState<ContactActionResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const reduceMotion = useReducedMotion()

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ContactFormValues>({
    defaultValues: { consent: undefined, subject: undefined },
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      formData.set(key, String(value ?? ''))
    })
    startTransition(async () => {
      const result = await submitContactForm(null, formData)
      setServerResult(result)
      if (result.ok) reset()
    })
  })

  if (serverResult?.ok) {
    return (
      <AnimatePresence>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-success/40 bg-success/10 p-8 text-center"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          role="status"
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={{ scale: 1 }}
            aria-hidden
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success text-white"
            initial={reduceMotion ? { scale: 1 } : { scale: 0.6 }}
            transition={{ delay: 0.1, duration: 0.3, type: 'spring' }}
          >
            ✓
          </motion.div>
          <h2 className="font-display text-2xl font-bold">Thank you — message sent</h2>
          <p className="mt-2 text-muted-foreground">
            We aim to reply within two working days. If it’s urgent, please ring us.
          </p>
          <button
            className="mt-6 font-medium text-brand underline"
            onClick={() => setServerResult(null)}
            type="button"
          >
            Send another message
          </button>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      {serverResult && !serverResult.ok && (
        <div
          className="rounded-xl border border-error/40 bg-error/10 px-4 py-3 font-medium"
          role="alert"
        >
          {serverResult.message}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field error={errors.name?.message} htmlFor="name" label="Your name" required>
          <input
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            className={cn(inputStyles, errors.name && 'border-error')}
            id="name"
            type="text"
            {...register('name')}
          />
        </Field>
        <Field error={errors.email?.message} htmlFor="email" label="Email address" required>
          <input
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className={cn(inputStyles, errors.email && 'border-error')}
            id="email"
            type="email"
            {...register('email')}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field error={errors.phone?.message} htmlFor="phone" label="Phone">
          <input
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            aria-invalid={Boolean(errors.phone)}
            autoComplete="tel"
            className={cn(inputStyles, errors.phone && 'border-error')}
            id="phone"
            type="tel"
            {...register('phone')}
          />
        </Field>
        <Field error={errors.subject?.message} htmlFor="subject" label="What’s it about?" required>
          <select
            aria-describedby={errors.subject ? 'subject-error' : undefined}
            aria-invalid={Boolean(errors.subject)}
            className={cn(inputStyles, errors.subject && 'border-error')}
            defaultValue=""
            id="subject"
            {...register('subject')}
          >
            <option disabled value="">
              Choose a subject…
            </option>
            {CONTACT_SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {contactSubjectLabels[subject]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field error={errors.message?.message} htmlFor="message" label="Your message" required>
        <textarea
          aria-describedby={errors.message ? 'message-error' : undefined}
          aria-invalid={Boolean(errors.message)}
          className={cn(inputStyles, 'min-h-36 resize-y', errors.message && 'border-error')}
          id="message"
          rows={6}
          {...register('message')}
        />
      </Field>

      {/* Honeypot — hidden from humans, tempting for bots */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input autoComplete="off" id="website" tabIndex={-1} type="text" {...register('website')} />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3" htmlFor="consent">
          <input
            aria-describedby={errors.consent ? 'consent-error' : undefined}
            aria-invalid={Boolean(errors.consent)}
            className="mt-1 h-5 w-5 shrink-0 accent-(--bb-accent)"
            id="consent"
            type="checkbox"
            {...register('consent')}
          />
          <span className="text-sm">
            I’m happy for BBAlliance to store this message and reply to me. See our{' '}
            <Link className="underline" href="/privacy-policy" target="_blank">
              privacy policy
            </Link>
            . <span aria-hidden className="text-brand">*</span>
          </span>
        </label>
        {errors.consent && (
          <p className="mt-1.5 text-sm font-medium text-error" id="consent-error" role="alert">
            {errors.consent.message}
          </p>
        )}
      </div>

      <button
        className="inline-flex h-12 items-center rounded-full bg-brand px-8 font-semibold text-brand-on transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
