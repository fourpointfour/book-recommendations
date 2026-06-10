import { useRef } from 'react'
import type { Book } from '../types/book'
import bookIcon from '../assets/book-icon.png'
import './BookListItem.css'

interface BookListItemProps {
  book: Book
}

const MAX_TILT = 12 // degrees

export function BookListItem({ book }: BookListItemProps) {
  const { meta } = book
  const hasImage = Boolean(meta.image && meta.image.trim().length > 0)
  const figureRef = useRef<HTMLDivElement | null>(null)

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = figureRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width // 0..1
    const py = (e.clientY - rect.top) / rect.height // 0..1
    const ry = (px - 0.5) * 2 * MAX_TILT // rotateY
    const rx = -(py - 0.5) * 2 * MAX_TILT // rotateX

    el.style.setProperty('--rx', `${rx.toFixed(2)}deg`)
    el.style.setProperty('--ry', `${ry.toFixed(2)}deg`)
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
  }

  const handleLeave = () => {
    const el = figureRef.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <article className="book">
      <div
        className="book-figure"
        ref={figureRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <div className="book-3d">
          <div className="book-cover">
            <img
              src={hasImage ? meta.image : bookIcon}
              alt={`Cover of ${meta.title}`}
              className="book-cover-img"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = bookIcon
              }}
            />
            <span className="book-sheen" aria-hidden="true" />
            <span className="book-spine" aria-hidden="true" />
            <span className="book-pages" aria-hidden="true" />

            <span className="book-seal" aria-hidden="true">
              <span className="book-seal-num">{meta.ratingValue}</span>
              <span className="book-seal-unit">/5</span>
            </span>

            <span className="book-prompt" aria-hidden="true">
              Read on
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
        <div className="book-shadow" aria-hidden="true" />
      </div>

      <div className="book-meta">
        <h3 className="book-name">{meta.title}</h3>
        <p className="book-author">{meta.author}</p>
      </div>
    </article>
  )
}
