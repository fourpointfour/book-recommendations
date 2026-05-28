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
