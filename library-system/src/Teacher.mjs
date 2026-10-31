import { User } from "./User.mjs";

export class Teacher extends User {
  get role() {
    return "Teacher";
  }
}
