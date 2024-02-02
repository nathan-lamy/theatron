import { Event } from "@prisma/client";

export const event = {
  async getWaitList(eventId: number) {
    return [];
  },
  serialize(event: Event) {
    return {};
  },
};
