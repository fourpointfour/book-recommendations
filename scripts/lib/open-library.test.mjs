// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchBooks } from './open-library.mjs'

const response = () => new Response(JSON.stringify({ docs: [{
  title: 'The Namesake', author_name: ['Jhumpa Lahiri'],
  first_publish_year: 2003, key: '/works/OL123W',
}] }))
const reset = () => new TypeError('fetch failed', {
  cause: Object.assign(new Error('read ECONNRESET'), { code: 'ECONNRESET' }),
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('Open Library search', () => {
  it('encodes the query and maps search results', async () => {
    const fetch = vi.fn().mockResolvedValue(response())
    vi.stubGlobal('fetch', fetch)
    expect(await searchBooks('The Namesake')).toEqual([{
      title: 'The Namesake', author: 'Jhumpa Lahiri', year: 2003,
      workKey: '/works/OL123W', coverEditionKey: null,
    }])
    expect(fetch.mock.calls[0][0]).toContain('q=The%20Namesake&limit=5')
    expect(fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal)
  })

  it('recovers from a temporary connection reset', async () => {
    vi.useFakeTimers()
    const fetch = vi.fn().mockRejectedValueOnce(reset()).mockResolvedValue(response())
    vi.stubGlobal('fetch', fetch)
    const result = searchBooks('The Namesake')
    await vi.runAllTimersAsync()
    expect(await result).toHaveLength(1)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('stops after three attempts and exposes the underlying network error', async () => {
    vi.useFakeTimers()
    const fetch = vi.fn().mockRejectedValue(reset())
    vi.stubGlobal('fetch', fetch)
    const result = expect(searchBooks('The Namesake')).rejects.toThrow(
      'Could not reach Open Library (ECONNRESET): read ECONNRESET',
    )
    await vi.runAllTimersAsync()
    await result
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it('does not retry certificate errors', async () => {
    const fetch = vi.fn().mockRejectedValue(new TypeError('fetch failed', {
      cause: Object.assign(new Error('certificate has expired'), { code: 'CERT_HAS_EXPIRED' }),
    }))
    vi.stubGlobal('fetch', fetch)
    await expect(searchBooks('The Namesake')).rejects.toThrow('CERT_HAS_EXPIRED')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('preserves HTTP error reporting', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('', { status: 503 }))
    vi.stubGlobal('fetch', fetch)
    await expect(searchBooks('The Namesake')).rejects.toThrow('Open Library search failed: 503')
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
