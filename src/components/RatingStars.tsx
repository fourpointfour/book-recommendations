import './RatingStars.css'

interface RatingStarsProps {
  rating: number
  max?: number
}

export function RatingStars({ rating, max = 5 }: RatingStarsProps) {
  const safeRating = Math.min(Math.max(rating, 0), max)

  return (
    <div className="rating-stars" aria-hidden="true">
      {Array.from({ length: max }).map((_, index) => {
        const starNumber = index + 1
        const isFull = safeRating >= starNumber
        const isHalf = !isFull && safeRating >= starNumber - 0.5
        const fillWidth = isFull ? '100%' : isHalf ? '50%' : '0%'

        return (
          <span key={starNumber} className="rating-stars-star">
            <span className="rating-stars-star-base">★</span>
            <span
              className="rating-stars-star-fill"
              style={{ width: fillWidth }}
            >
              ★
            </span>
          </span>
        )
      })}
      <span className="rating-stars-label">
        {safeRating.toFixed(1).replace(/\.0$/, '')}/{max}
      </span>
    </div>
  )
}

