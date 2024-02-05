import { eventsRepository } from "@/repositories/events";
import { sendEmail } from "@/services/email";
import { prisma } from "@/src/setup";
import { UserRegistration } from "@prisma/client";

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
    // Allow first member on wait list to register (if the user was not on wait list)
    if (!registration.waitListed) {
      const [firstOnWaitList] = await prisma.event.getWaitList(
        registration.eventId
      );
      if (firstOnWaitList) {
        // Give the first member on wait list the opportunity to register
        await prisma.userRegistration.removeWaitList(firstOnWaitList);
        await prisma.userRegistration.sendConfirmationEmail(firstOnWaitList);
      }
    }
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
  async setConfirmBeforeDate(registration: UserRegistration, date: Date) {
    await prisma.userRegistration.update({
      where: {
        id: registration.id,
      },
      data: {
        confirmBefore: date,
      },
    });
  },
  async sendConfirmationEmail(registration: UserRegistration) {
    // Retrieve the event
    const event = (await eventsRepository.getEventById(registration.eventId))!;

    if (!registration.confirmBefore) {
      // Set the confirm before date to 4 weeks before the event
      const confirmBefore = new Date(event.date);
      confirmBefore.setDate(confirmBefore.getDate() - 4 * 7);
      // Save the confirm before date
      await prisma.userRegistration.setConfirmBeforeDate(
        registration,
        confirmBefore
      );
      registration.confirmBefore = confirmBefore;
    }

    // Send the confirmation email
    await sendEmail("confirm-registration", {
      event,
      registration,
      includeLink: true,
    });
  },
  //   TODO:
  serialize(registration: UserRegistration) {
    return {};
  },
};
