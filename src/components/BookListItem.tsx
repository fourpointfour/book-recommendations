import type { Book } from '../types/book'
import bookIcon from '../assets/book-icon.png'
import './BookListItem.css'

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
            onError={(event) => {
              event.currentTarget.src = bookIcon
            }}
          />
        ) : (
          <img
            src={bookIcon}
            alt={`Default cover for ${meta.title}`}
            className="book-list-item-thumb-img"
          />
        )}
      </div>
      <div className="book-list-item-text">
        <span className="book-list-item-title">{meta.title}</span>
        <span className="book-list-item-author">{meta.author}</span>
      </div>
    </div>
  )
}
