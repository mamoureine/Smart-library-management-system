import { User } from "./User.js";

export class Student extends User {
  get role() {
    return "Student";
  }
}
