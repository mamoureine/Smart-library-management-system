import { Student } from "./Student.js";
import { Teacher } from "./Teacher.js";

export class UserFactory {
  constructor() {
    throw new TypeError("UserFactory cannot be instantiated");
  }

  static createUser(role, id, name, email) {
    if (typeof role !== "string") {
      throw new TypeError("role must be a string");
    }

    switch (role.trim().toLowerCase()) {
      case "student":
        return new Student(id, name, email);
      case "teacher":
        return new Teacher(id, name, email);
      default:
        throw new RangeError(`Unsupported user role: ${role}`);
    }
  }
}
