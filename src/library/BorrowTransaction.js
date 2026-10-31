import { toDateString } from "./dateUtils.js";

function requireText(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${fieldName} must be a non-empty string`);
  }
  return value;
}

export class BorrowTransaction {
  #id;
  #borrower;
  #book;
  #borrowedOn;
  #dueDate;
  #returnedOn = null;
  #overdue = false;

  constructor(id, borrower, book, borrowedOn, dueDate) {
    this.#id = requireText(id, "id");
    if (!borrower || !book) {
      throw new TypeError("borrower and book are required");
    }

    this.#borrower = borrower;
    this.#book = book;
    this.#borrowedOn = toDateString(borrowedOn, "borrowedOn");
    this.#dueDate = toDateString(dueDate, "dueDate");
    if (this.#dueDate < this.#borrowedOn) {
      throw new RangeError("dueDate must not be before borrowedOn");
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
      throw new RangeError("returnDate must not be before borrowedOn");
    }
    this.#returnedOn = normalizedDate;
  }
}
