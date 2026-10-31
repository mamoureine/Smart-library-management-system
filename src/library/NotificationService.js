export class NotificationService {
  #observers = new Set();

  register(observer) {
    if (!observer || typeof observer.onBookOverdue !== "function") {
      throw new TypeError("observer must implement onBookOverdue");
    }
    this.#observers.add(observer);
  }

  unregister(observer) {
    this.#observers.delete(observer);
  }

  notifyOverdue(transaction) {
    for (const observer of this.#observers) {
      if (observer === transaction.borrower) {
        observer.onBookOverdue(transaction);
      }
    }
  }
}
