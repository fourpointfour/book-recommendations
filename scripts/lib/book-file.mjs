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
