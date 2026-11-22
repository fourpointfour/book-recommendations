const SEARCH_URL = 'https://openlibrary.org/search.json'
const COVERS_URL = 'https://covers.openlibrary.org/b/olid'
const TRANSIENT_ERRORS = new Set([
  'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ECONNREFUSED',
  'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_SOCKET',
])

async function fetchSearch(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetch(url, { signal: AbortSignal.timeout(20_000) })
    } catch (error) {
      const code = error.cause?.code ?? error.code ?? error.name
      const transient = TRANSIENT_ERRORS.has(code) || error.name === 'TimeoutError'
      if (transient && attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
        continue
      }
      throw new Error(`Could not reach Open Library (${code}): ${error.cause?.message ?? error.message}`, { cause: error })
    }
  }
}

export async function searchBooks(query) {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&limit=5`
  const res = await fetchSearch(url)
  if (!res.ok) throw new Error(`Open Library search failed: ${res.status}`)
  const { docs = [] } = await res.json()
  return docs.map(doc => ({
    title: doc.title,
    author: (doc.author_name ?? [])[0] ?? 'Unknown',
    year: doc.first_publish_year ?? 'Unknown',
    workKey: doc.key,
    coverEditionKey: doc.cover_edition_key ?? null,
  }))
}

export function buildCoverUrl(coverEditionKey) {
  if (!coverEditionKey) return null
  return `${COVERS_URL}/${coverEditionKey}-L.jpg`
}

export function buildOpenLibraryLink(workKey) {
  return `https://openlibrary.org${workKey}`
}
