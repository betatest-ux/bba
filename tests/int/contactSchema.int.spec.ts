import { describe, expect, it } from 'vitest'

import { contactSchema } from '@/forms/contactSchema'

const valid = {
  consent: true,
  email: 'amina@example.com',
  message: 'Hello — I would like to volunteer at the pantry on Saturdays.',
  name: 'Amina Begum',
  phone: '01254 000000',
  subject: 'volunteering',
  website: '',
}

describe('contact form validation', () => {
  it('accepts a valid submission', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts an empty optional phone', () => {
    expect(contactSchema.safeParse({ ...valid, phone: '' }).success).toBe(true)
  })

  it('rejects a missing name', () => {
    const result = contactSchema.safeParse({ ...valid, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid email', () => {
    expect(contactSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false)
  })

  it('rejects a too-short message', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'hi' }).success).toBe(false)
  })

  it('rejects letters in the phone number', () => {
    expect(contactSchema.safeParse({ ...valid, phone: 'call me maybe' }).success).toBe(false)
  })

  it('rejects an unknown subject', () => {
    expect(contactSchema.safeParse({ ...valid, subject: 'spam' }).success).toBe(false)
  })

  it('requires consent', () => {
    expect(contactSchema.safeParse({ ...valid, consent: false }).success).toBe(false)
  })

  it('rejects when the honeypot is filled (bot traffic)', () => {
    expect(contactSchema.safeParse({ ...valid, website: 'https://spam.example' }).success).toBe(
      false,
    )
  })
})
