import { prisma } from "@/src/setup";

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
            // TODO: Check if the event is not full if priority = 1 and set waitListed to false
            waitListed: true,
          })),
        },
      },
      include: {
        registrations: true,
      },
    });
  }

  // TODO:
  public verifyToken(
    token: string,
    { eventId, email }: { eventId: string; email: string }
  ) {
    return true;
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
