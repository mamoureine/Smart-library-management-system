import assert from "node:assert/strict";
import test from "node:test";
import {
  Book,
  LibrarySystem,
  Student,
  Teacher,
  User,
  UserFactory,
} from "../src/index.mjs";

test("user factory creates supported user types and rejects invalid roles", () => {
  const student = UserFactory.createUser("student", "student-test", "Sam", "sam@example.com");
  const teacher = UserFactory.createUser("TEACHER", "teacher-test", "Taylor", "taylor@example.com");

  assert.ok(student instanceof Student);
  assert.ok(teacher instanceof Teacher);
  assert.equal(student.role, "Student");
  assert.equal(teacher.role, "Teacher");
  assert.throws(() => new User("id", "name", "email"), /abstract/);
  assert.throws(() => UserFactory.createUser("librarian", "id", "name", "email"), /Unsupported/);
});

test("library singleton manages books, borrowing, overdue notices, and returns", () => {
  const library = LibrarySystem.getInstance();
  const student = UserFactory.createUser(
    "student",
    "lifecycle-student",
    "Alex",
    "alex@example.com",
  );
  const teacher = UserFactory.createUser(
    "teacher",
    "lifecycle-teacher",
    "Casey",
    "casey@example.com",
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
    () => library.borrowBook(student.id, book.id, "2024-02-30", "2024-02-01"),
    /valid calendar date/,
  );
  assert.equal(book.available, true);

  const transaction = library.borrowBook(
    student.id,
    book.id,
    "2024-02-02",
    "2024-02-01",
  );
  assert.equal(book.available, false);
  assert.deepEqual(library.getBorrowedBooks(student.id), [book]);
  assert.throws(
    () => library.borrowBook(teacher.id, book.id, "2024-02-03", "2024-02-02"),
    /already borrowed/,
  );

  assert.deepEqual(library.checkOverdueTransactions("2024-02-02"), []);
  assert.equal(transaction.overdue, false);
  assert.deepEqual(library.checkOverdueTransactions("2024-02-03"), [transaction]);
  assert.deepEqual(library.checkOverdueTransactions("2024-02-04"), [transaction]);
  assert.equal(transaction.overdue, true);
  assert.equal(student.getNotifications().length, 1);
  assert.equal(teacher.getNotifications().length, 0);

  const notifications = student.getNotifications();
  notifications.push("external change");
  assert.equal(student.getNotifications().length, 1);

  library.returnBook(transaction.id, "2024-02-04");
  assert.equal(book.available, true);
  assert.deepEqual(library.getBorrowedBooks(student.id), []);
  assert.throws(() => library.returnBook(transaction.id, "2024-02-04"), /already returned/);
  assert.deepEqual(library.checkOverdueTransactions("2024-02-05"), []);
});

test("invalid returns and missing users do not change library state", () => {
  const library = LibrarySystem.getInstance();
  const user = UserFactory.createUser(
    "student",
    "validation-student",
    "Jordan",
    "jordan@example.com",
  );
  const book = new Book("validation-book", "Another Book", "An Author");
  library.addUser(user);
  library.addBook(book);

  assert.throws(() => library.getBorrowedBooks("missing-user"), /User not found/);
  const transaction = library.borrowBook(
    user.id,
    book.id,
    "2024-03-05",
    "2024-03-01",
  );

  assert.throws(() => library.returnBook(transaction.id, "2024-02-28"), /before borrowedOn/);
  assert.equal(book.available, false);
  assert.equal(transaction.returned, false);
});
