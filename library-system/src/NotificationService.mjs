export class NotificationService {
  #observers = new Set();

  register(observer) {
    if (observer === null || typeof observer?.onBookOverdue !== "function") {
      throw new TypeError("observer must implement onBookOverdue(transaction)");
    }

    this.#observers.add(observer);
  }

  unregister(observer) {
    return this.#observers.delete(observer);
  }

  notifyOverdue(transaction) {
    const borrower = transaction?.borrower;
    if (this.#observers.has(borrower)) {
      borrower.onBookOverdue(transaction);
    }
  }
}
