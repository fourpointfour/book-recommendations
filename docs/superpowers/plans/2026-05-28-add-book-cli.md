# Add Book CLI Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node.js CLI script (`npm run add-book`) that searches Open Library, auto-fills book metadata, opens the user's editor for notes, and writes a `.md` file to `src/books/` — with a `--batch` flag for multi-book sessions.

**Architecture:** The CLI is split across four small modules in `scripts/lib/` (pure utils, file I/O, Open Library API, editor) composed by the entry point `scripts/add-book.mjs`. Pure functions live in `book-utils.mjs` with no Node I/O imports so they can be unit-tested by Vitest. The interactive parts (network, subprocess, readline) are not unit-tested.

**Tech Stack:** Node.js 18+ ESM (`.mjs`), built-in `readline/promises`, `node:fs`, `node:child_process`, `node:os`; Vitest for unit tests; Open Library Search + Covers APIs (no API key required).

---

### Task 1: Add npm script and scaffold `scripts/` directory

**Files:**
- Modify: `package.json`
- Create: `scripts/lib/.gitkeep` (directory scaffold — deleted in Task 2)

- [ ] **Step 1: Create the scripts directory**

```bash
mkdir -p scripts/lib
```

- [ ] **Step 2: Add npm script to package.json**

In `package.json`, add `"add-book"` to the `"scripts"` object:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run",
  "add-book": "node scripts/add-book.mjs"
},
```

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add add-book npm script"
```

---

### Task 2: Pure utility functions with tests (TDD)

**Files:**
- Create: `scripts/lib/book-utils.mjs`
- Create: `src/test/book-utils.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/test/book-utils.test.ts`:

```ts
// @vitest-environment node
// @ts-ignore — .mjs script module, untyped
import { slugify, validateRating, buildFrontmatter, buildMarkdownFile } from '../../scripts/lib/book-utils.mjs'
import { describe, it, expect } from 'vitest'

describe('slugify', () => {
  it('lowercases and hyphenates words', () => {
    expect(slugify('The Great Gatsby')).toBe('the-great-gatsby')
  })
  it('strips non-alphanumeric characters', () => {
    expect(slugify("And Then There Were None")).toBe('and-then-there-were-none')
  })
  it('collapses multiple spaces and hyphens', () => {
    expect(slugify('A  B')).toBe('a-b')
  })
  it('strips punctuation without leaving double hyphens', () => {
    expect(slugify("Harry Potter & the Philosopher's Stone")).toBe(
      'harry-potter-the-philosophers-stone'
    )
  })
})

describe('validateRating', () => {
  it('accepts integer rating', () => {
    expect(validateRating('4/5')).toBe(true)
  })
  it('accepts decimal rating', () => {
    expect(validateRating('4.5/5')).toBe(true)
  })
  it('rejects missing denominator', () => {
    expect(validateRating('4')).toBe(false)
  })
  it('rejects wrong denominator', () => {
    expect(validateRating('4/10')).toBe(false)
  })
  it('rejects non-numeric numerator', () => {
    expect(validateRating('good/5')).toBe(false)
  })
  it('trims surrounding whitespace', () => {
    expect(validateRating('  3.5/5  ')).toBe(true)
  })
})

describe('buildFrontmatter', () => {
  it('includes all fields when image is provided', () => {
    const result = buildFrontmatter({
      title: 'Test Book',
      author: 'Test Author',
      image: 'https://covers.openlibrary.org/b/olid/OL12345M-L.jpg',
      rating: '4/5',
      buyLink: 'https://openlibrary.org/works/OL1W',
    })
    expect(result).toContain('title: "Test Book"')
    expect(result).toContain('author: "Test Author"')
    expect(result).toContain('image: "https://covers.openlibrary.org/b/olid/OL12345M-L.jpg"')
    expect(result).toContain('rating: "4/5"')
    expect(result).toContain('buyLink: "https://openlibrary.org/works/OL1W"')
    expect(result.startsWith('---')).toBe(true)
    expect(result.endsWith('---')).toBe(true)
  })
  it('omits image line when image is not provided', () => {
    const result = buildFrontmatter({
      title: 'Test',
      author: 'Author',
      rating: '3/5',
      buyLink: 'https://openlibrary.org/works/OL2W',
    })
    expect(result).not.toContain('image:')
  })
})

describe('buildMarkdownFile', () => {
  it('combines frontmatter and notes with a blank line between', () => {
    const result = buildMarkdownFile(
      { title: 'T', author: 'A', rating: '5/5', buyLink: 'https://openlibrary.org/works/OL3W' },
      '## Why I recommend this book\n\nGreat read.'
    )
    expect(result).toContain('---\n\n## Why I recommend this book')
  })
  it('trims leading/trailing whitespace from notes', () => {
    const result = buildMarkdownFile(
      { title: 'T', author: 'A', rating: '5/5', buyLink: 'https://openlibrary.org/works/OL3W' },
      '\n\n  Notes here.  \n\n'
    )
    expect(result.endsWith('Notes here.\n')).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run -- src/test/book-utils.test.ts
```

Expected output: error like `Cannot find module '../../scripts/lib/book-utils.mjs'`

- [ ] **Step 3: Create `scripts/lib/book-utils.mjs`**

```js
export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function validateRating(str) {
  return /^\d+(\.\d+)?\/5$/.test(str.trim())
}

export function buildFrontmatter({ title, author, image, rating, buyLink }) {
  const lines = ['---', `title: "${title}"`, `author: "${author}"`]
  if (image) lines.push(`image: "${image}"`)
  lines.push(`rating: "${rating}"`)
  lines.push(`buyLink: "${buyLink}"`)
  lines.push('---')
  return lines.join('\n')
}

export function buildMarkdownFile(meta, notes) {
  return `${buildFrontmatter(meta)}\n\n${notes.trim()}\n`
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test:run -- src/test/book-utils.test.ts
```

Expected: all 12 tests pass, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/book-utils.mjs src/test/book-utils.test.ts
git commit -m "feat: add book-utils pure functions with tests"
```

---

### Task 3: File I/O module

**Files:**
- Create: `scripts/lib/book-file.mjs`

- [ ] **Step 1: Create `scripts/lib/book-file.mjs`**

```js
import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildMarkdownFile } from './book-utils.mjs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const BOOKS_DIR = join(__dirname, '../../src/books')

export function bookFilePath(slug) {
  return join(BOOKS_DIR, `${slug}.md`)
}

export function fileExists(slug) {
  return existsSync(bookFilePath(slug))
}

export function writeBookFile(slug, meta, notes) {
  writeFileSync(bookFilePath(slug), buildMarkdownFile(meta, notes), 'utf8')
}
```

- [ ] **Step 2: Verify the full test suite still passes**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/book-file.mjs
git commit -m "feat: add book file I/O module"
```

---

### Task 4: Open Library API module

**Files:**
- Create: `scripts/lib/open-library.mjs`

- [ ] **Step 1: Create `scripts/lib/open-library.mjs`**

```js
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
```

- [ ] **Step 2: Manually verify the API works**

```bash
node -e "
import('./scripts/lib/open-library.mjs').then(m =>
  m.searchBooks('Atomic Habits').then(r => console.log(JSON.stringify(r, null, 2)))
)
"
```

Expected: JSON array with up to 5 objects, each with `title`, `author`, `year`, `workKey`, `coverEditionKey`.

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/open-library.mjs
git commit -m "feat: add Open Library API module"
```

---

### Task 5: Editor integration module

**Files:**
- Create: `scripts/lib/editor.mjs`

- [ ] **Step 1: Create `scripts/lib/editor.mjs`**

```js
import { writeFileSync, readFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const TEMPLATE = `## Why I recommend this book

<!-- Write your thoughts here -->

### Favorite ideas

1. `

export function openInEditor(template = TEMPLATE) {
  const tmpFile = join(tmpdir(), `book-notes-${Date.now()}.md`)
  writeFileSync(tmpFile, template, 'utf8')
  const editor = process.env.EDITOR ?? 'vi'
  const result = spawnSync(editor, [tmpFile], { stdio: 'inherit' })
  if (result.error) {
    unlinkSync(tmpFile)
    throw new Error(`Failed to open editor "${editor}": ${result.error.message}`)
  }
  const content = readFileSync(tmpFile, 'utf8')
  unlinkSync(tmpFile)
  return content
}
```

- [ ] **Step 2: Manually verify editor opens**

```bash
node -e "import('./scripts/lib/editor.mjs').then(m => { const c = m.openInEditor(); console.log('Got:', c.slice(0, 50)) })"
```

Expected: your `$EDITOR` opens with the template, and after closing, "Got:" prints the first 50 characters of what you saved.

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/editor.mjs
git commit -m "feat: add editor integration module"
```

---

### Task 6: Main CLI entry point (single-book flow)

**Files:**
- Create: `scripts/add-book.mjs`

- [ ] **Step 1: Create `scripts/add-book.mjs`**

```js
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

  const result = await addBook(rl)
  if (result) created.push(result)

  rl.close()
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
```

- [ ] **Step 2: Run a manual end-to-end test**

```bash
npm run add-book
```

Expected flow:
1. Prompts "Search for a book:"
2. Shows up to 5 results from Open Library
3. Prompts for selection (1–N)
4. Shows selected title + cover URL
5. Prompts for rating, re-prompts if invalid format
6. Prompts for buy link (Enter uses Open Library link)
7. Opens `$EDITOR`
8. After closing, prints "✓ Created: src/books/<slug>.md"
9. Verify the file was created: `ls src/books/`

- [ ] **Step 3: Commit**

```bash
git add scripts/add-book.mjs
git commit -m "feat: add add-book CLI script (single-book flow)"
```

---

### Task 7: Add `--batch` mode

**Files:**
- Modify: `scripts/add-book.mjs`

- [ ] **Step 1: Replace the `main()` function in `scripts/add-book.mjs`**

Replace the `main` function (the last function in the file, before the `main().catch(...)` line) with:

```js
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
```

- [ ] **Step 2: Manually verify batch mode**

```bash
npm run add-book -- --batch
```

Expected: after each book is saved, prompts "Add another book? (y/n)". On "y", loops back to search. On "n", prints summary of all files created.

- [ ] **Step 3: Verify single-book mode still works**

```bash
npm run add-book
```

Expected: exits after adding one book without prompting "Add another".

- [ ] **Step 4: Run full test suite to check for regressions**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/add-book.mjs
git commit -m "feat: add --batch flag to add-book CLI"
```

---

### Task 8: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the "How to add a book" section**

In `README.md`, replace the entire section from `## How to add a book` through step 4 and the following `---` separator (lines 73–90) with:

```markdown
## How to add a book

### Using the CLI (recommended)

```bash
# Add a single book
npm run add-book

# Add multiple books in one session
npm run add-book -- --batch
```

The script searches Open Library for the book, auto-fills the cover image and a default buy link (Open Library page), lets you override the buy link with your own URL, and opens your `$EDITOR` for notes. The `.md` file is written to `src/books/` when you close the editor.

Once the file is created, commit and push — GitHub Pages will deploy automatically.

### Adding manually

1. Create a new `.md` file in `src/books/`. Use an existing file as a template — e.g. [`src/books/and-then-there-were-none.md`](src/books/and-then-there-were-none.md).
2. Fill in the frontmatter:

```yaml
---
title: "Book Title"
author: "Author Name"
image: "https://..."        # Cover image URL
rating: "4/5"               # Your rating (X/5 or X.X/5)
buyLink: "https://..."      # Purchase or info link
---
```

3. Write your recommendation in Markdown below the frontmatter.
4. Commit and push — GitHub Pages will deploy automatically.

---
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README with add-book CLI instructions"
```
