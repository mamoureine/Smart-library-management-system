function requireText(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${fieldName} must be a non-empty string`);
  }
  return value;
}

export class User {
  #id;
  #name;
  #email;
  #notifications = [];

  constructor(id, name, email) {
    if (new.target === User) {
      throw new TypeError("User is abstract and cannot be instantiated directly");
    }
    this.#id = requireText(id, "id");
    this.#name = requireText(name, "name");
    this.#email = requireText(email, "email");
  }

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get email() {
    return this.#email;
  }

  get role() {
    throw new Error("Subclasses must implement the role getter");
  }

  onBookOverdue(transaction) {
    this.#notifications.push(
      `Overdue: ${transaction.book.title} (due ${transaction.dueDate})`,
    );
  }

  getNotifications() {
    return [...this.#notifications];
  }
}
