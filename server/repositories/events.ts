import { prisma } from "@/src/setup";
import type { Event } from "@prisma/client";

class EventsRepository {
  // Retrieve event
  public async getById(id: number) {
    return prisma.event.findUnique({
      where: {
        id: id,
      },
    });
  }

  // Retrieve all events
  public async getAll(
    { includesRegistrations } = { includesRegistrations: false }
  ) {
    return prisma.event.findMany({
      include: {
        registrations: includesRegistrations,
      },
    });
  }

  // Close event
  public async close(event: Event) {
    return prisma.event
      .update({
        where: {
          id: event.id,
        },
        data: {
          closed: true,
        },
      })
      .then((event) => this.allocatePlaces(event));
  }

  // Allocate places to wait listed users
  private async allocatePlaces(event: Event) {
    // TODO: Implement this method
    // const waitList = await prisma.event.getWaitList(event.id);
    // for (const registration of waitList) {
    //   await prisma.userRegistration.removeWaitList(registration);
    //   await prisma.userRegistration.sendConfirmationEmail(registration, event);
    // }
  }
}

export const eventsRepository = new EventsRepository();
