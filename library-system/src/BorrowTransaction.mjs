import { toDateString } from "./dateUtils.mjs";
import { Book } from "./Book.mjs";
import { User } from "./User.mjs";
import { requireText } from "./validation.mjs";

export class BorrowTransaction {
  #id;
  #borrower;
  #book;
  #borrowedOn;
  #dueDate;
  #returnedOn = null;
  #overdue = false;

  constructor(id, borrower, book, borrowedOn, dueDate) {
    if (!(borrower instanceof User)) {
      throw new TypeError("borrower must be a User");
    }
    if (!(book instanceof Book)) {
      throw new TypeError("book must be a Book");
    }

    this.#id = requireText(id, "id");
    this.#borrower = borrower;
    this.#book = book;
    this.#borrowedOn = toDateString(borrowedOn, "borrowedOn");
    this.#dueDate = toDateString(dueDate, "dueDate");

    if (this.#dueDate < this.#borrowedOn) {
      throw new RangeError("dueDate cannot be before borrowedOn");
    }
  }

  get id() {
    return this.#id;
  }

  get borrower() {
    return this.#borrower;
  }

  get book() {
    return this.#book;
  }

  get borrowedOn() {
    return this.#borrowedOn;
  }

  get dueDate() {
    return this.#dueDate;
  }

  get returnedOn() {
    return this.#returnedOn;
  }

  get returned() {
    return this.#returnedOn !== null;
  }

  get overdue() {
    return this.#overdue;
  }

  markOverdue() {
    if (this.returned || this.#overdue) {
      return false;
    }

    this.#overdue = true;
    return true;
  }

  markReturned(returnDate) {
    if (this.returned) {
      throw new Error(`Transaction is already returned: ${this.#id}`);
    }

    const normalizedDate = toDateString(returnDate, "returnDate");
    if (normalizedDate < this.#borrowedOn) {
      throw new RangeError("returnDate cannot be before borrowedOn");
    }

    this.#returnedOn = normalizedDate;
  }
}
