import { prisma } from "@/src/setup";
import { UserRegistration } from "@prisma/client";

// TODO: Generic method
export const userRegistration = {
  async confirm(registration: UserRegistration) {
    await prisma.userRegistration.update({
      where: {
        id: registration.id,
      },
      data: {
        confirmed: true,
      },
    });
  },
  async cancel(registration: UserRegistration) {
    await prisma.userRegistration.update({
      where: {
        id: registration.id,
      },
      data: {
        cancelled: true,
      },
    });
  },
  async removeWaitList(registration: UserRegistration) {
    await prisma.userRegistration.update({
      where: {
        id: registration.id,
      },
      data: {
        waitListed: false,
      },
    });
  },
  //   TODO:
  async sendConfirmationEmail(registration: UserRegistration) {
    return {};
  },
  //   TODO:
  serialize(registration: UserRegistration) {
    return {};
  },
};
