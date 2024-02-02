import { prisma } from "@/src/setup";

class UsersRepository {
  // Retrieve user
  public async getUserById(id: number) {
    return prisma.user.findUnique({
      where: {
        id: id,
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
