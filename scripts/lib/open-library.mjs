const SEARCH_URL = 'https://openlibrary.org/search.json'
const COVERS_URL = 'https://covers.openlibrary.org/b/olid'

export async function searchBooks(query) {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&limit=5`
  const res = await fetch(url)
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
