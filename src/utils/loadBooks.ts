import type { Book, BookFrontmatter, BookMeta } from '../types/book'

const bookFiles = import.meta.glob('../books/*.md', {
  as: 'raw',
  eager: true,
})

type RawModuleMap = Record<string, string>

interface ParsedMarkdown {
  frontmatter: BookFrontmatter
  body: string
}

function parseFrontmatter(raw: string): ParsedMarkdown {
  const parts = raw.split('---')

  if (parts.length < 3) {
    throw new Error('Markdown file is missing frontmatter.')
  }

  const frontmatterBlock = parts[1]
  const body = parts.slice(2).join('---').trim()

  const fmLines = frontmatterBlock
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const data: Partial<BookFrontmatter> = {}

  for (const line of fmLines) {
    const [rawKey, ...rest] = line.split(':')
    if (!rawKey || rest.length === 0) continue

    const key = rawKey.trim() as keyof BookFrontmatter
    const rawValue = rest.join(':').trim()
    const value = rawValue.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')

    if (value.length === 0) continue

    ;(data as any)[key] = value
  }

  if (!data.title || !data.author || !data.rating || !data.buyLink) {
    throw new Error('Frontmatter is missing required fields.')
  }

  return {
    frontmatter: data as BookFrontmatter,
    body,
  }
}

function parseRatingValue(rating: string): number {
  const [raw] = rating.split('/')
  const value = Number.parseFloat(raw)

  if (!Number.isFinite(value)) {
    throw new Error(`Invalid rating value: ${rating}`)
  }

  return value
}

function toSlug(path: string): string {
  const match = path.match(/([^/]+)\.md$/)
  return match ? match[1] : path
}

export function loadBooks(): Book[] {
  const modules = bookFiles as unknown as RawModuleMap

  const entries = Object.entries(modules).filter(([path]) => {
    return !path.endsWith('example-book.md')
  })

  const books: Book[] = entries.map(([path, rawContent]) => {
    const { frontmatter, body } = parseFrontmatter(rawContent)

    const slug = toSlug(path)
    const ratingValue = parseRatingValue(frontmatter.rating)

    const meta: BookMeta = {
      ...frontmatter,
      slug,
      ratingValue,
    }

    return {
      id: slug,
      meta,
      notes: body,
    }
  })

  return books.sort((a, b) => a.meta.title.localeCompare(b.meta.title))
}

