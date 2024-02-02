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
}

export const eventsRepository = new EventsRepository();
