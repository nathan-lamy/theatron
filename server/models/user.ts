import { prisma } from "@/src/setup";
import { User } from "@prisma/client";

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  classNumber: string;
  classLevel: string;
  selectedEvents: number[];
}

export const user = {
  /**
   * Retrieve an user by its id
   */
  async getById(id: number) {
    return prisma.user.findUnique({
      where: {
        id: id,
      },
    });
  },
  /**
   * Register a new user and its registrations for the selected events
   */
  async register(data: UserData) {
    // TODO: Block registration for past events
    // TODO: or if the event is really soon ?? 3 days before the event
    // Get the top priority event(s) (multiple events if some are closed)
    const preferredEvents = await getTopPriorityEvent(data);
    return prisma.user.create({
      data: {
        email: data.email,
        name: `${toTitleCase(data.firstName)} ${data.lastName.toUpperCase()}`,
        class: `${data.classLevel} ${data.classNumber}`,
        registrations: {
          create: data.selectedEvents.map((eventId) => ({
            eventId: eventId,
            // CAUTION: The priority is 1-indexed
            priority: data.selectedEvents.indexOf(eventId) + 1,
            waitListed: !preferredEvents.some((event) => event.id === eventId),
          })),
        },
      },
      include: {
        registrations: true,
      },
    });
  },
  /**
   * Retrieve the user's registration for an event
   */
  async getRegistration(eventId: number, email: string) {
    return prisma.userRegistration.findFirst({
      where: {
        eventId: eventId,
        user: {
          email: email,
        },
      },
    });
  },
  /**
   * Retrieve all the user's registrations including the event details
   */
  async getRegistrationsWithEvents(user: User) {
    return prisma.userRegistration.findMany({
      where: {
        userId: user.id,
      },
      include: {
        event: true,
      },
    });
  },
  /**
   * Serialize the user object
   */
  serialize(user: User) {
    return user;
  },
};

/**
 * Get the top priority event(s) for the user
 */
async function getTopPriorityEvent(data: UserData) {
  // Retrieve events and count registrations
  const events = await prisma.event.getAllAndCountRegistrations();

  const preferredEvents = [];
  for (const eventId of data.selectedEvents) {
    const event = events.find((event) => event.id === eventId);
    if (event && event._count.registrations < event.capacity) {
      // Loop through the selected events that are closed
      // OR Look for the event with the highest priority
      if (event.closed || preferredEvents.length < 1) {
        preferredEvents.push(event);
      }
    }
  }

  return preferredEvents;
}

/**
 * Capitalize the first letter of each word in a string
 */
const toTitleCase = (str: string) =>
  str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
