# Library Management System

A standalone JavaScript implementation of user management, book management, and borrowing transactions. The modules use ES modules and run on Node.js without third-party dependencies.

## Patterns

- **Factory:** `UserFactory.createUser(role, id, name, email)` creates students and teachers.
- **Singleton:** `LibrarySystem.getInstance()` provides the central library instance.
- **Observer:** the library registers users for overdue notifications when they are added.

## Example

```js
import { Book, LibrarySystem, UserFactory } from "./src/index.mjs";

const library = LibrarySystem.getInstance();
const student = UserFactory.createUser(
  "student",
  "student-1",
  "Ari",
  "ari@example.com",
);

library.addUser(student);
library.addBook(new Book("book-1", "Example", "Author"));
const transaction = library.borrowBook(
  student.id,
  "book-1",
  "2026-11-15",
);

library.checkOverdueTransactions("2026-11-16");
console.log(student.getNotifications());
library.returnBook(transaction.id);
```

Dates may be passed as `Date` objects or `YYYY-MM-DD` strings. An overdue notice is sent once per transaction when its due date has passed.

## Tests

Run with Node.js:

```sh
node --test library-system/test/library-system.test.mjs
```
