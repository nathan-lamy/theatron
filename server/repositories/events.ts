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
    // Fetch registered users (not cancelled and not wait listed)
    const registered = await prisma.userRegistration.count({
      where: {
        eventId: event.id,
        cancelled: false,
        waitListed: false,
      },
    });
    if (registered >= event.capacity) {
      return console.error(
        `🦊 Event ${event.name} is over capacity, please check the registrations`
      );
    }
    // Fetch wait listed users
    // Take the number of places available (capacity - registered)
    const waitList = await prisma.event.getWaitList(
      event.id,
      event.capacity - registered
    );
    // Allocate places to wait listed users
    for (const registration of waitList) {
      await prisma.userRegistration.removeWaitList(registration);
      await prisma.userRegistration.sendConfirmationEmail(registration, event);
    }
  }
}

export const eventsRepository = new EventsRepository();
