import test from "node:test";
import assert from "node:assert/strict";
import {
  Book,
  LibrarySystem,
  Student,
  Teacher,
  User,
  UserFactory,
} from "../src/library/index.js";

function addDays(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

test("factory creates supported user types and rejects unknown roles", () => {
  const student = UserFactory.createUser(
    "STUDENT",
    "test-student",
    "Test Student",
    "student@example.com",
  );
  const teacher = UserFactory.createUser(
    "teacher",
    "test-teacher",
    "Test Teacher",
    "teacher@example.com",
  );

  assert.ok(student instanceof Student);
  assert.ok(teacher instanceof Teacher);
  assert.equal(student.role, "Student");
  assert.equal(teacher.role, "Teacher");
  assert.throws(() => new User("id", "name", "email"), /abstract/);
  assert.throws(
    () => UserFactory.createUser("librarian", "id", "name", "email"),
    /Unsupported user role/,
  );
});

test("singleton manages borrowing, overdue notifications, and returns", () => {
  const library = LibrarySystem.getInstance();
  const student = UserFactory.createUser(
    "student",
    "lifecycle-student",
    "Library Student",
    "lifecycle-student@example.com",
  );
  const teacher = UserFactory.createUser(
    "teacher",
    "lifecycle-teacher",
    "Library Teacher",
    "lifecycle-teacher@example.com",
  );
  const book = new Book("lifecycle-book", "Test Book", "Test Author");

  assert.equal(library, LibrarySystem.getInstance());
  assert.throws(() => new LibrarySystem(), /getInstance/);

  library.addUser(student);
  library.addUser(teacher);
  library.addBook(book);

  assert.throws(() => library.addUser(student), /already exists/);
  assert.throws(() => library.addBook(book), /already exists/);
  assert.throws(
    () => library.borrowBook(student.id, book.id, addDays(-1)),
    /dueDate must not be before borrowedOn/,
  );
  assert.equal(book.available, true);

  const transaction = library.borrowBook(student.id, book.id, addDays(1));
  assert.equal(book.available, false);
  assert.deepEqual(library.getBorrowedBooks(student.id), [book]);
  assert.throws(
    () => library.borrowBook(teacher.id, book.id, addDays(1)),
    /not available/,
  );

  library.checkOverdueTransactions(addDays(1));
  assert.equal(transaction.overdue, false);
  library.checkOverdueTransactions(addDays(2));
  library.checkOverdueTransactions(addDays(3));
  assert.equal(transaction.overdue, true);
  assert.equal(student.getNotifications().length, 1);
  assert.equal(teacher.getNotifications().length, 0);

  const notifications = student.getNotifications();
  notifications.push("external change");
  assert.equal(student.getNotifications().length, 1);

  library.returnBook(transaction.id, addDays(2));
  assert.equal(book.available, true);
  assert.deepEqual(library.getBorrowedBooks(student.id), []);
  assert.throws(() => library.returnBook(transaction.id), /already returned/);
  assert.throws(() => library.getBorrowedBooks("missing-user"), /User not found/);
});
