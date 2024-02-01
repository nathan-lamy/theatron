import { Event } from "./event";

export class User {
  public isOnWaitList(event: Event) {
    return false;
  }

  public hasConfirmedRegistration(event: Event) {
    return false;
  }

  public async confirmRegistration(event: Event) {
    throw new Error("Method not implemented.");
  }

  public async cancelRegistration(event: Event) {
    throw new Error("Method not implemented.");
  }

  public async sendConfirmationEmail(event: Event) {
    throw new Error("Method not implemented.");
  }

  public serialize() {
    throw new Error("Method not implemented.");
  }
}
