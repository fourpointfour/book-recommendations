import { useState } from 'react'
import type { Book } from '../types/book'
import { loadBooks } from '../utils/loadBooks'
import { BookListItem } from './BookListItem'
import { BookModal } from './BookModal'
import './BookList.css'

export function BookList() {
  const books: Book[] = loadBooks()
  const [activeBook, setActiveBook] = useState<Book | null>(null)

  if (books.length === 0) {
    return (
      <div className="book-list book-list--empty" role="status">
        <p className="book-list-empty-message">
          No books yet. Add markdown files under <code>src/books/</code> to see them here.
        </p>
      </div>
    )
  }

  const handleItemClick = (book: Book) => {
    setActiveBook(book)
  }

  const handleItemKeyDown = (event: React.KeyboardEvent<HTMLLIElement>, book: Book) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setActiveBook(book)
    }
  }

  const handleCloseModal = () => {
    setActiveBook(null)
  }

  return (
    <>
      <ul className="book-list" aria-label="Book recommendations">
        {books.map((book) => (
          <li
            key={book.id}
            className="book-list-item"
            tabIndex={0}
            role="button"
            onClick={() => handleItemClick(book)}
            onKeyDown={(event) => handleItemKeyDown(event, book)}
          >
            <BookListItem book={book} />
          </li>
        ))}
      </ul>

      <BookModal book={activeBook} open={Boolean(activeBook)} onClose={handleCloseModal} />
    </>
  )
}
