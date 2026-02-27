import type { Book } from '../types/book'
import './BookListItem.css'

function DefaultBookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
    </svg>
  )
}

interface BookListItemProps {
  book: Book
}

export function BookListItem({ book }: BookListItemProps) {
  const { meta } = book
  const hasImage = meta.image && meta.image.trim().length > 0

  return (
    <div className="book-list-item-content">
      <div className="book-list-item-thumb">
        {hasImage ? (
          <img
            src={meta.image}
            alt={`Cover of ${meta.title}`}
            className="book-list-item-thumb-img"
          />
        ) : (
          <DefaultBookIcon className="book-list-item-thumb-icon" />
        )}
      </div>
      <div className="book-list-item-text">
        <span className="book-list-item-title">{meta.title}</span>
        <span className="book-list-item-author">{meta.author}</span>
      </div>
    </div>
  )
}
