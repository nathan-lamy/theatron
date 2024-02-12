import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/src/setup";
import type { Event, User } from "@prisma/client";
import { eventsRepository } from "./events";

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  classNumber: string;
  classLevel: string;
  selectedEvents: number[];
}

class UsersRepository {
  // Retrieve user
  public async getUserById(id: number) {
    return prisma.user.findUnique({
      where: {
        id: id,
      },
    });
  }

  // Register user
  public async register(data: UserData) {
    const preferredEvent = await this.getTopPriorityEvent(data);
    return prisma.user.create({
      data: {
        email: data.email,
        name: `${toTitleCase(data.firstName)} ${data.lastName.toUpperCase()}`,
        class: `${data.classNumber}${data.classLevel}`,
        registrations: {
          create: data.selectedEvents.map((eventId) => ({
            eventId: eventId,
            // CAUTION: The priority is 1-indexed
            priority: data.selectedEvents.indexOf(eventId) + 1,
            waitListed: preferredEvent?.id !== eventId,
          })),
        },
      },
      include: {
        registrations: true,
      },
    });
  }

  private async getTopPriorityEvent(data: UserData) {
    // TODO: Handle closed events
    // Retrieve events and count registrations
    const events = await eventsRepository.getAllAndCountRegistrations();

    // Look for the event with the highest priority and that is not full
    // const preferredEvents = [];
    for (const eventId of data.selectedEvents) {
      const event = events.find((event) => event.id === eventId);
      if (
        event &&
        event._count.registrations < event.capacity &&
        // TODO: Handle closed events
        !event.closed
      ) {
        return event;
      }
    }
  }

  // Verify token from signed link
  public verifyToken(
    token: string,
    { eventId, email }: { eventId: string; email: string }
  ) {
    return timingSafeEqual(
      Buffer.from(token),
      Buffer.from(this.generateToken(email, eventId))
    );
  }

  // Generate signed link for confirmation
  public generateSignedLink(user: User, event: Event) {
    const url = new URL(Bun.env.FRONTEND_URL!);
    url.pathname = "/confirm/" + event.id;
    url.searchParams.set("token", this.generateToken(user.email, event.id));
    url.searchParams.set("email", user.email);
    return url.toString();
  }

  // Generate token
  private generateToken(email: string, eventId: number | string) {
    return createHmac("sha1", Bun.env.HMAC_KEY!)
      .update(email + ":" + eventId)
      .digest("hex");
  }

  // Retrieve user registration (used in server/controllers/events.ts middleware)
  public async getUserRegistration(eventId: number, email: string) {
    return prisma.userRegistration.findFirst({
      where: {
        eventId: eventId,
        user: {
          email: email,
        },
      },
    });
  }
}

export const usersRepository = new UsersRepository();

const toTitleCase = (str: string) =>
  str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
