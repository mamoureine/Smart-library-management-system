import { Book } from "./Book.mjs";
import { BorrowTransaction } from "./BorrowTransaction.mjs";
import { NotificationService } from "./NotificationService.mjs";
import { toDateString } from "./dateUtils.mjs";
import { User } from "./User.mjs";
import { requireText } from "./validation.mjs";

const singletonKey = Symbol("LibrarySystem");

export class LibrarySystem {
  static #instance;

  #users = new Map();
  #books = new Map();
  #transactions = new Map();
  #notificationService = new NotificationService();
  #nextTransactionId = 1;

  constructor(key) {
    if (key !== singletonKey) {
      throw new TypeError("Use LibrarySystem.getInstance()");
    }
  }

  static getInstance() {
    if (!LibrarySystem.#instance) {
      LibrarySystem.#instance = new LibrarySystem(singletonKey);
    }

    return LibrarySystem.#instance;
  }

  addUser(user) {
    if (!(user instanceof User)) {
      throw new TypeError("user must be a User");
    }
    if (this.#users.has(user.id)) {
      throw new Error(`User already exists: ${user.id}`);
    }

    this.#users.set(user.id, user);
    this.#notificationService.register(user);
    return user;
  }

  addBook(book) {
    if (!(book instanceof Book)) {
      throw new TypeError("book must be a Book");
    }
    if (this.#books.has(book.id)) {
      throw new Error(`Book already exists: ${book.id}`);
    }

    this.#books.set(book.id, book);
    return book;
  }

  borrowBook(userId, bookId, dueDate, borrowedOn = new Date()) {
    const normalizedUserId = requireText(userId, "userId");
    const normalizedBookId = requireText(bookId, "bookId");
    const user = this.#users.get(normalizedUserId);
    const book = this.#books.get(normalizedBookId);

    if (!user) {
      throw new Error(`User not found: ${normalizedUserId}`);
    }
    if (!book) {
      throw new Error(`Book not found: ${normalizedBookId}`);
    }
    if (!book.available) {
      throw new Error(`Book is already borrowed: ${normalizedBookId}`);
    }

    const transaction = new BorrowTransaction(
      `transaction-${this.#nextTransactionId}`,
      user,
      book,
      borrowedOn,
      dueDate,
    );

    book.markBorrowed();
    this.#transactions.set(transaction.id, transaction);
    this.#nextTransactionId += 1;
    return transaction;
  }

  returnBook(transactionId, returnedOn = new Date()) {
    const normalizedId = requireText(transactionId, "transactionId");
    const transaction = this.#transactions.get(normalizedId);

    if (!transaction) {
      throw new Error(`Transaction not found: ${normalizedId}`);
    }
    if (transaction.returned) {
      throw new Error(`Transaction is already returned: ${normalizedId}`);
    }

    const normalizedReturnDate = toDateString(returnedOn, "returnedOn");
    if (normalizedReturnDate < transaction.borrowedOn) {
      throw new RangeError("returnedOn cannot be before borrowedOn");
    }

    transaction.book.markReturned();
    transaction.markReturned(normalizedReturnDate);
    return transaction;
  }

  checkOverdueTransactions(asOfDate = new Date()) {
    const date = toDateString(asOfDate, "asOfDate");
    const overdueTransactions = [];

    for (const transaction of this.#transactions.values()) {
      if (!transaction.returned && transaction.dueDate < date) {
        overdueTransactions.push(transaction);
        if (transaction.markOverdue()) {
          this.#notificationService.notifyOverdue(transaction);
        }
      }
    }

    return overdueTransactions;
  }

  getBorrowedBooks(userId) {
    const normalizedUserId = requireText(userId, "userId");
    if (!this.#users.has(normalizedUserId)) {
      throw new Error(`User not found: ${normalizedUserId}`);
    }

    return [...this.#transactions.values()]
      .filter(
        (transaction) =>
          transaction.borrower.id === normalizedUserId && !transaction.returned,
      )
      .map((transaction) => transaction.book);
  }

  getUsers() {
    return [...this.#users.values()];
  }

  getBooks() {
    return [...this.#books.values()];
  }

  getTransactions() {
    return [...this.#transactions.values()];
  }
}
