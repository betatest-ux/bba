'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import React, { useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'

import { applicationSchema, type ApplicationFormValues } from '@/forms/applicationSchema'
import { cn } from '@/utilities/ui'
import { submitApplication, type ApplicationActionResult } from '../actions'

const inputStyles =
  'w-full rounded-xl border border-input bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-3 focus-visible:outline-brand min-h-11'

const MAX_CV_BYTES = 5 * 1024 * 1024 // 5MB
const CV_EXTENSIONS = ['.pdf', '.doc', '.docx']

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

const validateCV = (file: File | null): string | null => {
  if (!file) return 'Attach your CV as a PDF or Word document.'
  if (file.size === 0) return 'That file looks empty — please choose another.'
  if (file.size > MAX_CV_BYTES) return 'That file is too big — please keep your CV under 5MB.'
  const name = file.name.toLowerCase()
  if (!CV_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    return 'We can only accept PDF or Word documents (.pdf, .doc, .docx).'
  }
  return null
}

const formatFileSize = (bytes: number): string =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)}MB` : `${Math.ceil(bytes / 1024)}KB`

export const ApplicationForm: React.FC<{ vacancyId: number; vacancyTitle: string }> = ({
  vacancyId,
  vacancyTitle,
}) => {
  const [serverResult, setServerResult] = useState<ApplicationActionResult | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvError, setCvError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const reduceMotion = useReducedMotion()

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ApplicationFormValues>({
    defaultValues: { consent: undefined },
    resolver: zodResolver(applicationSchema),
  })

  const clearFile = () => {
    setCvFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setCvFile(file)
    setCvError(file ? validateCV(file) : null)
  }

  const onSubmit = handleSubmit((values) => {
    const fileProblem = validateCV(cvFile)
    if (fileProblem) {
      setCvError(fileProblem)
      return
    }

    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      formData.set(key, String(value ?? ''))
    })
    formData.set('vacancyId', String(vacancyId))
    if (cvFile) formData.set('cv', cvFile)

    startTransition(async () => {
      const result = await submitApplication(null, formData)
      setServerResult(result)
      if (result.ok) {
        reset()
        clearFile()
        setCvError(null)
      } else if (result.fieldErrors?.cv) {
        setCvError(result.fieldErrors.cv)
      }
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
          <h3 className="font-display text-2xl font-bold">Thank you — application received</h3>
          <p className="mt-2 text-muted-foreground">
            Your application for {vacancyTitle} has landed safely with the team. We read every
            single one, and we’ll reply to everyone after the closing date.
          </p>
          <button
            className="mt-6 font-medium text-brand underline"
            onClick={() => setServerResult(null)}
            type="button"
          >
            Send another application
          </button>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <form aria-label={`Application form for ${vacancyTitle}`} className="space-y-5" noValidate onSubmit={onSubmit}>
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
      </div>

      <Field
        error={errors.coverNote?.message}
        hint="A few lines about you and why this role caught your eye — no need for anything formal."
        htmlFor="coverNote"
        label="Cover note"
        required
      >
        <textarea
          aria-describedby={cn(errors.coverNote && 'coverNote-error', 'coverNote-hint')}
          aria-invalid={Boolean(errors.coverNote)}
          className={cn(inputStyles, 'min-h-36 resize-y', errors.coverNote && 'border-error')}
          id="coverNote"
          rows={6}
          {...register('coverNote')}
        />
      </Field>

      {/* CV upload — a real file input dressed up as a drop zone */}
      <div>
        <p className="mb-1.5 block font-medium" id="cv-label">
          Your CV
          <span aria-hidden className="text-brand">
            {' '}
            *
          </span>
        </p>
        <label
          className={cn(
            'flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors duration-200 focus-within:outline-3 focus-within:outline-brand',
            cvError ? 'border-error bg-error/5' : 'border-input bg-card hover:border-brand hover:bg-brand-soft/40',
          )}
          htmlFor="cv"
        >
          <input
            accept=".pdf,.doc,.docx"
            aria-describedby={cvError ? 'cv-error' : 'cv-hint'}
            aria-invalid={Boolean(cvError)}
            aria-labelledby="cv-label"
            className="sr-only"
            id="cv"
            name="cv"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
          {cvFile ? (
            <>
              <span className="font-medium break-all">{cvFile.name}</span>
              <span className="text-sm text-muted-foreground">
                {formatFileSize(cvFile.size)} — click to choose a different file
              </span>
            </>
          ) : (
            <>
              <span className="font-medium text-brand">Choose a file</span>
              <span className="text-sm text-muted-foreground" id="cv-hint">
                PDF or Word document (.pdf, .doc, .docx), up to 5MB
              </span>
            </>
          )}
        </label>
        {cvError && (
          <p className="mt-1.5 text-sm font-medium text-error" id="cv-error" role="alert">
            {cvError}
          </p>
        )}
      </div>

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
            I’m happy for BBAlliance to store my application and CV so the team can consider me for
            this role. See our{' '}
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
        {isPending ? 'Sending…' : 'Send application'}
      </button>
      <p aria-live="polite" className="sr-only">
        {isPending ? 'Sending your application…' : ''}
      </p>
    </form>
  )
}
