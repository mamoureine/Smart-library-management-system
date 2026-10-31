import { requireText } from "./validation.mjs";

export class Book {
  #id;
  #title;
  #author;
  #available = true;

  constructor(id, title, author) {
    this.#id = requireText(id, "id");
    this.#title = requireText(title, "title");
    this.#author = requireText(author, "author");
  }

  get id() {
    return this.#id;
  }

  get title() {
    return this.#title;
  }

  get author() {
    return this.#author;
  }

  get available() {
    return this.#available;
  }

  markBorrowed() {
    if (!this.#available) {
      throw new Error(`Book is already borrowed: ${this.#id}`);
    }

    this.#available = false;
  }

  markReturned() {
    if (this.#available) {
      throw new Error(`Book is already available: ${this.#id}`);
    }

    this.#available = true;
  }
}
