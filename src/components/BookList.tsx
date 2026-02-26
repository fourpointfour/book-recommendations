import type { Book } from '../types/book'
import { loadBooks } from '../utils/loadBooks'
import './BookList.css'

export function BookList() {
  const books: Book[] = loadBooks()

  if (books.length === 0) {
    return (
      <div className="book-list book-list--empty" role="status">
        <p className="book-list-empty-message">
          No books yet. Add markdown files under <code>src/books/</code> to see them here.
        </p>
      </div>
    )
  }

  return (
    <ul className="book-list" aria-label="Book recommendations">
      {books.map((book) => (
        <li key={book.id} className="book-list-item">
          <span className="book-list-item-title">{book.meta.title}</span>
          <span className="book-list-item-author">{book.meta.author}</span>
        </li>
      ))}
    </ul>
  )
}
