import { z } from 'zod'

export const CONTACT_SUBJECTS = [
  'general',
  'volunteering',
  'donations',
  'media',
  'partnerships',
  'other',
] as const

export const contactSubjectLabels: Record<(typeof CONTACT_SUBJECTS)[number], string> = {
  donations: 'Donations',
  general: 'General',
  media: 'Media',
  other: 'Other',
  partnerships: 'Partnerships',
  volunteering: 'Volunteering',
}

/**
 * Shared client + server validation for the flagship contact form.
 * Server-side this is the source of truth — never trust the client alone.
 */
export const contactSchema = z.object({
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm you’re happy for us to store your message.' }),
  }),
  email: z.string().trim().email('Enter a valid email address, e.g. name@example.com'),
  message: z
    .string()
    .trim()
    .min(10, 'Tell us a little more — at least 10 characters.')
    .max(5000, 'Please keep your message under 5,000 characters.'),
  name: z.string().trim().min(2, 'Enter your name.').max(120, 'That name looks too long.'),
  phone: z
    .string()
    .trim()
    .max(30, 'That phone number looks too long.')
    .regex(/^[+\d\s().-]*$/, 'Phone numbers can only contain digits, spaces and + ( ) - .')
    .optional()
    .or(z.literal('')),
  subject: z.enum(CONTACT_SUBJECTS, { errorMap: () => ({ message: 'Choose a subject.' }) }),
  // Honeypot — humans never see or fill this field.
  website: z.string().max(0, 'Spam detected.').optional().or(z.literal('')),
})

export type ContactFormValues = z.infer<typeof contactSchema>
