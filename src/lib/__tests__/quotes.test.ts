import { describe, expect, it } from 'vitest'
import { addDays } from '../dates'
import { QUOTES, quoteForDate } from '../quotes'

describe('quoteForDate', () => {
  it('returns the same quote for the same date', () => {
    expect(quoteForDate('2026-09-18')).toBe(quoteForDate('2026-09-18'))
  })

  it('moves to the next quote on the next day', () => {
    const today = QUOTES.indexOf(quoteForDate('2026-09-18'))
    const tomorrow = QUOTES.indexOf(quoteForDate('2026-09-19'))
    expect(tomorrow).toBe((today + 1) % QUOTES.length)
  })

  it('shows every quote exactly once per full cycle', () => {
    const seen = new Set<string>()
    for (let day = 0; day < QUOTES.length; day++) {
      seen.add(quoteForDate(addDays('2026-09-01', day)).text)
    }
    expect(seen.size).toBe(QUOTES.length)
  })

  it('still resolves to a real quote for dates before the starting point', () => {
    expect(QUOTES).toContain(quoteForDate('2025-06-15'))
  })
})

describe('QUOTES', () => {
  it('has no duplicate quotes', () => {
    expect(new Set(QUOTES.map((quote) => quote.text)).size).toBe(QUOTES.length)
  })

  it('names an author for every quote', () => {
    for (const quote of QUOTES) expect(quote.author.trim()).not.toBe('')
  })

  it('keeps every quote short enough for the card', () => {
    for (const quote of QUOTES) expect(quote.text.length).toBeLessThanOrEqual(140)
  })

  it('avoids guilt and hustle language, per the product rules', () => {
    const banned = /\b(lazy|excuses?|failures?|losers?|grind|hustle)\b/i
    for (const quote of QUOTES) expect(quote.text).not.toMatch(banned)
  })
})
