import { z } from 'zod'

/**
 * Shared client + server validation for job application forms.
 * Server-side this is the source of truth — never trust the client alone.
 * The CV file is validated separately in the server action (files can’t
 * travel through this schema cleanly).
 */
export const applicationSchema = z.object({
  consent: z.literal(true, {
    errorMap: () => ({
      message: 'Please confirm you’re happy for us to store your application.',
    }),
  }),
  coverNote: z
    .string()
    .trim()
    .min(30, 'Tell us a little more about yourself — at least 30 characters.')
    .max(5000, 'Please keep your note under 5,000 characters.'),
  email: z.string().trim().email('Enter a valid email address, e.g. name@example.com'),
  name: z.string().trim().min(2, 'Enter your name.').max(120, 'That name looks too long.'),
  phone: z
    .string()
    .trim()
    .max(30, 'That phone number looks too long.')
    .regex(/^[+\d\s().-]*$/, 'Phone numbers can only contain digits, spaces and + ( ) - .')
    .optional()
    .or(z.literal('')),
  // Honeypot — humans never see or fill this field.
  website: z.string().max(0, 'Spam detected.').optional().or(z.literal('')),
})

export type ApplicationFormValues = z.infer<typeof applicationSchema>
