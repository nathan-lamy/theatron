import { prisma } from "@/src/setup";
import { Event } from "@prisma/client";

export const event = {
  /**
   * Retrieve an event by its id
   */
  async getById(id: number) {
    return prisma.event.findUnique({
      where: {
        id: id,
      },
    });
  },
  /**
   * Retrieve all events
   */
  async getAll({ includesRegistrations } = { includesRegistrations: false }) {
    return prisma.event.findMany({
      include: {
        registrations: includesRegistrations,
      },
    });
  },
  /**
   * Retrieve all events and count the number of registrations for each
   */
  async getAllAndCountRegistrations() {
    return prisma.event.findMany({
      include: {
        _count: { select: { registrations: true } },
      },
    });
  },
  /**
   * Close an event and allocate places to wait listed users
   */
  async close(event: Event) {
    return prisma.event
      .update({
        where: {
          id: event.id,
        },
        data: {
          closed: true,
        },
      })
      .then((event) => allocatePlaces(event));
  },
  /**
   * Retrieve the wait list for an event
   * (sorted by priority and date of registration)
   * and take the first n registrations
   */
  async getWaitList(eventId: number, take?: number) {
    return prisma.userRegistration.findMany({
      where: {
        eventId: eventId,
        waitListed: true,
        cancelled: false,
      },
      orderBy: [
        // Sort by priority and date of registration
        {
          priority: "asc",
        },
        {
          date: "asc",
        },
      ],
      take: take,
    });
  },
  serialize(event: Event) {
    return event;
  },
};

/**
 * Allocate places to wait listed users
 */
async function allocatePlaces(event: Event) {
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
