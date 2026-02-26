export type RatingString = `${number}/5`

export interface BookFrontmatter {
  title: string
  author: string
  image?: string
  rating: RatingString
  buyLink: string
}

export interface BookMeta extends BookFrontmatter {
  slug: string
  ratingValue: number
}

export interface Book {
  id: string
  meta: BookMeta
  notes: string
}

