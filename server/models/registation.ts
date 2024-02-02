import { UserRegistration } from "@prisma/client";

export const userRegistration = {
  async confirm(registration: UserRegistration) {
    return {};
  },
  async cancel(registration: UserRegistration) {
    return {};
  },
  async cancelWaitList(registration: UserRegistration) {
    return {};
  },
  async sendConfirmationEmail(registration: UserRegistration) {
    return {};
  },
  serialize(registration: UserRegistration) {
    return {};
  },
};
