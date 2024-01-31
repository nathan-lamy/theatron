class UsersRepository {
  // TODO:
  public verifyToken(
    token: string,
    { eventId, email }: { eventId: string; email: string }
  ) {
    return true;
  }

  public async getUsers(eventId: string) {
    return [];
  }

  public async getUser(eventId: string, email: string) {
    return {};
  }
}

export const usersRepository = new UsersRepository();
