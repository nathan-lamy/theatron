import { usersRepository } from "@/repositories/users";
import { email } from "../shared/validator";
import { Elysia, t } from "elysia";

export const register = new Elysia().post(
  "/register",
  async ({ body, set }) => {
    const result = await usersRepository.register(body).catch((error) => {
      if (error.code === "P2002") {
        return { error: "EMAIL_ALREADY_REGISTERED" };
      }
      throw error;
    });
    if ("error" in result) {
      set.status = 409;
      return result;
    }
    return { success: true };
  },
  {
    body: t.Object({
      email,
      firstName: t.String({ minLength: 1, maxLength: 50 }),
      lastName: t.String({ minLength: 1, maxLength: 50 }),
      classNumber: t.String({ minLength: 1, maxLength: 1 }),
      classLevel: t.String({
        pattern: "Seconde|Première|Terminale",
        default: "Seconde",
      }),
      selectedEvents: t.Array(t.Number()),
    }),
  }
);
