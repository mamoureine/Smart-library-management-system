import { User } from "./User.mjs";

export class Student extends User {
  get role() {
    return "Student";
  }
}
