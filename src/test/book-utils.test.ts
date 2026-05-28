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
