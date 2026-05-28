import * as rlPromises from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { searchBooks, buildCoverUrl, buildOpenLibraryLink } from './lib/open-library.mjs'
import { openInEditor } from './lib/editor.mjs'
import { slugify, validateRating } from './lib/book-utils.mjs'
import { fileExists, writeBookFile } from './lib/book-file.mjs'

export const isBatch = process.argv.includes('--batch')

export async function addBook(rl) {
  const query = (await rl.question('\nSearch for a book: ')).trim()
  if (!query) return null

  console.log('Searching Open Library...')
  let results
  try {
    results = await searchBooks(query)
  } catch (err) {
    console.error(`Search failed: ${err.message}`)
    return null
  }

  if (results.length === 0) {
    console.log('No results found. Try a different search.')
    return null
  }

  console.log()
  results.forEach((book, i) => {
    console.log(`  ${i + 1}. ${book.title} — ${book.author} (${book.year})`)
  })

  const selStr = (await rl.question(`\nSelect a book (1–${results.length}): `)).trim()
  const sel = parseInt(selStr, 10)
  if (Number.isNaN(sel) || sel < 1 || sel > results.length) {
    console.log('Invalid selection. Skipping.')
    return null
  }
  const chosen = results[sel - 1]

  const coverUrl = buildCoverUrl(chosen.coverEditionKey)
  const defaultBuyLink = buildOpenLibraryLink(chosen.workKey)

  console.log(`\nSelected: "${chosen.title}" by ${chosen.author}`)
  if (coverUrl) console.log(`Cover:    ${coverUrl}`)

  let rating
  for (;;) {
    rating = (await rl.question('Rating (e.g. 4.5/5): ')).trim()
    if (validateRating(rating)) break
    console.log('  Invalid format — use X/5 or X.X/5 (e.g. 4/5 or 4.5/5).')
  }

  const buyInput = (await rl.question('Buy link (Enter to use Open Library link): ')).trim()
  const buyLink = buyInput || defaultBuyLink

  console.log('\nOpening editor for notes (save and close when done)...')
  let notes
  try {
    notes = openInEditor()
  } catch (err) {
    console.error(`Editor error: ${err.message}`)
    return null
  }

  const slug = slugify(chosen.title)
  if (fileExists(slug)) {
    console.log(`\nWarning: src/books/${slug}.md already exists. Skipping.`)
    return null
  }

  const meta = {
    title: chosen.title,
    author: chosen.author,
    image: coverUrl ?? undefined,
    rating,
    buyLink,
  }

  writeBookFile(slug, meta, notes)
  console.log(`\n✓ Created: src/books/${slug}.md`)
  return { slug, title: chosen.title }
}

async function main() {
  const rl = rlPromises.createInterface({ input, output })
  const created = []

  do {
    const result = await addBook(rl)
    if (result) created.push(result)

    if (isBatch) {
      const again = (await rl.question('\nAdd another book? (y/n): ')).trim().toLowerCase()
      if (again !== 'y') break
    }
  } while (isBatch)

  rl.close()

  if (isBatch && created.length > 0) {
    console.log(`\n--- ${created.length} book(s) added ---`)
    created.forEach(b => console.log(`  "${b.title}" → src/books/${b.slug}.md`))
  }
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
