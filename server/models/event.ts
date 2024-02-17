import { prisma } from "@/src/setup";
import { Event } from "@prisma/client";

export const event = {
  async getWaitList(eventId: number, take: number = 1) {
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
  // TODO:
  serialize(event: Event) {
    return event;
  },
};
