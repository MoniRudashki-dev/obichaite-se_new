import { describe, expect, it } from 'vitest'
import { mapProfileToKlaviyo } from '../mappers/profile.mapper'

describe('mapProfileToKlaviyo', () => {
  it('trims and lowercases the email', () => {
    const profile = mapProfileToKlaviyo({ email: '  Ivan.Petrov@Example.COM ' })
    expect(profile.email).toBe('ivan.petrov@example.com')
  })

  it('returns undefined email when empty/whitespace', () => {
    expect(mapProfileToKlaviyo({ email: '   ' }).email).toBeUndefined()
    expect(mapProfileToKlaviyo({}).email).toBeUndefined()
  })

  it('splits the full name into first/last', () => {
    const profile = mapProfileToKlaviyo({ email: 'a@b.com', fullName: 'Иван Петров Иванов' })
    expect(profile.firstName).toBe('Иван')
    expect(profile.lastName).toBe('Петров Иванов')
  })

  it('handles a single-word name and missing name', () => {
    expect(mapProfileToKlaviyo({ fullName: 'Иван' }).firstName).toBe('Иван')
    expect(mapProfileToKlaviyo({ fullName: 'Иван' }).lastName).toBeUndefined()
    const none = mapProfileToKlaviyo({ email: 'a@b.com' })
    expect(none.firstName).toBeUndefined()
    expect(none.lastName).toBeUndefined()
  })

  it('trims the phone number', () => {
    expect(mapProfileToKlaviyo({ phone: ' +359888 ' }).phoneNumber).toBe('+359888')
    expect(mapProfileToKlaviyo({ phone: '  ' }).phoneNumber).toBeUndefined()
  })

  it('always sets source/environment and merges custom properties', () => {
    const profile = mapProfileToKlaviyo({
      email: 'a@b.com',
      properties: { marketing_consent_source: 'checkout' },
    })
    expect(profile.properties).toMatchObject({
      source: 'website',
      environment: expect.any(String),
      marketing_consent_source: 'checkout',
    })
  })
})
