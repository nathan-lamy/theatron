import { prisma } from "@/src/setup";

class EventsRepository {
  // Retrieve event
  public async getEventById(id: number) {
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
}

export const eventsRepository = new EventsRepository();
