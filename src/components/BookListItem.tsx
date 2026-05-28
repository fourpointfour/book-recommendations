import type { Book } from '../types/book'
import bookIcon from '../assets/book-icon.png'
import { RatingStars } from './RatingStars'
import './BookListItem.css'

interface BookListItemProps {
  book: Book
}

export function BookListItem({ book }: BookListItemProps) {
  const { meta } = book
  const hasImage = meta.image && meta.image.trim().length > 0

  return (
    <div className="book-card">
      <div className="book-card-cover">
        {hasImage ? (
          <img
            src={meta.image}
            alt={`Cover of ${meta.title}`}
            className="book-card-cover-img"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = bookIcon
            }}
          />
        ) : (
          <img
            src={bookIcon}
            alt={`Default cover for ${meta.title}`}
            className="book-card-cover-img"
          />
        )}
        <span className="book-card-badge" aria-hidden="true">
          <span className="book-card-badge-star">&#9733;</span>
          {' '}{meta.ratingValue}
        </span>
        <div className="book-card-hover-overlay" aria-hidden="true">
          <span>Click for details</span>
        </div>
      </div>
      <div className="book-card-info">
        <span className="book-card-title">{meta.title}</span>
        <span className="book-card-author">{meta.author}</span>
        <div className="book-card-rating">
          <RatingStars rating={meta.ratingValue} />
        </div>
      </div>
    </div>
  )
}
