import { User } from "@prisma/client";

export const user = {
  serialize(user: User) {
    return user;
  },
};
