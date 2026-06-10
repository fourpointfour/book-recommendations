import type { Book } from '../types/book'
import bookIcon from '../assets/book-icon.png'
import { RatingStars } from './RatingStars'
import './BookListItem.css'

interface BookListItemProps {
  book: Book
  index?: number
}

export function BookListItem({ book, index = 0 }: BookListItemProps) {
  const { meta } = book
  const hasImage = meta.image && meta.image.trim().length > 0

  return (
    <article className="volume">
      <div className="volume-stage">
        <div className="volume-book">
          <span className="volume-spine" aria-hidden="true" />
          <span className="volume-pages" aria-hidden="true" />
          <div className="volume-cover">
            <img
              src={hasImage ? meta.image : bookIcon}
              alt={hasImage ? `Cover of ${meta.title}` : `Default cover for ${meta.title}`}
              className="volume-cover-img"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = bookIcon
              }}
            />
            <span className="volume-sheen" aria-hidden="true" />
          </div>
        </div>
        <span className="volume-shadow" aria-hidden="true" />
        <span className="volume-peek" aria-hidden="true">
          Open the notes
        </span>
      </div>

      <div className="volume-meta">
        <span className="volume-index" aria-hidden="true">
          № {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="volume-title">{meta.title}</h3>
        <p className="volume-author">{meta.author}</p>
        <div className="volume-rating">
          <RatingStars rating={meta.ratingValue} />
        </div>
      </div>
    </article>
  )
}
