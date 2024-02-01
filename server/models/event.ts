import { User } from "./user";

export class Event {
  public async confirmRegistration(event: Event) {
    throw new Error("Method not implemented.");
  }

  public async getWaitList(): Promise<User[]> {
    throw new Error("Method not implemented.");
  }

  public async removeMemberFromWaitList(firstOnWaitList: User) {
    throw new Error("Method not implemented.");
  }

  public serialize() {
    throw new Error("Method not implemented.");
  }
}
