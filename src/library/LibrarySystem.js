import { Book } from "./Book.js";
import { BorrowTransaction } from "./BorrowTransaction.js";
import { NotificationService } from "./NotificationService.js";
import { toDateString } from "./dateUtils.js";
import { User } from "./User.js";

export class LibrarySystem {
  static #instance;

  #users = new Map();
  #books = new Map();
  #transactions = new Map();
  #notificationService = new NotificationService();

  constructor(token) {
    if (token !== LibrarySystem) {
      throw new TypeError("Use LibrarySystem.getInstance()");
    }
  }

  static getInstance() {
    if (!LibrarySystem.#instance) {
      LibrarySystem.#instance = new LibrarySystem(LibrarySystem);
    }
    return LibrarySystem.#instance;
  }

  addUser(user) {
    if (!(user instanceof User)) {
      throw new TypeError("user must be a User");
    }
    if (this.#users.has(user.id)) {
      throw new Error(`User id already exists: ${user.id}`);
    }
    this.#users.set(user.id, user);
    this.#notificationService.register(user);
  }

  addBook(book) {
    if (!(book instanceof Book)) {
      throw new TypeError("book must be a Book");
    }
    if (this.#books.has(book.id)) {
      throw new Error(`Book id already exists: ${book.id}`);
    }
    this.#books.set(book.id, book);
  }

  borrowBook(userId, bookId, dueDate, borrowedOn = new Date()) {
    const borrower = this.#requireUser(userId);
    const book = this.#requireBook(bookId);
    if (!book.available) {
      throw new Error(`Book is not available: ${bookId}`);
    }

    const transaction = new BorrowTransaction(
      globalThis.crypto.randomUUID(),
      borrower,
      book,
      borrowedOn,
      dueDate,
    );
    book.markBorrowed();
    this.#transactions.set(transaction.id, transaction);
    return transaction;
  }

  returnBook(transactionId, returnedOn = new Date()) {
    const transaction = this.#requireTransaction(transactionId);
    transaction.markReturned(returnedOn);
    transaction.book.markReturned();
  }

  checkOverdueTransactions(asOfDate) {
    const checkDate = toDateString(asOfDate, "asOfDate");
    for (const transaction of this.#transactions.values()) {
      if (
        !transaction.returned &&
        checkDate > transaction.dueDate &&
        transaction.markOverdue()
      ) {
        this.#notificationService.notifyOverdue(transaction);
      }
    }
  }

  getBorrowedBooks(userId) {
    this.#requireUser(userId);
    return [...this.#transactions.values()]
      .filter(
        (transaction) =>
          !transaction.returned && transaction.borrower.id === userId,
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

  #requireUser(userId) {
    const user = this.#users.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    return user;
  }

  #requireBook(bookId) {
    const book = this.#books.get(bookId);
    if (!book) {
      throw new Error(`Book not found: ${bookId}`);
    }
    return book;
  }

  #requireTransaction(transactionId) {
    const transaction = this.#transactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }
    return transaction;
  }
}
