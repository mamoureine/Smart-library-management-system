import { User } from "./User.js";

export class Teacher extends User {
  get role() {
    return "Teacher";
  }
}
