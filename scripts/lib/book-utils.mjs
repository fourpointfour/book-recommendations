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
