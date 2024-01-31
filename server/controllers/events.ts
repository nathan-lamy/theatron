import { eventsRepository } from "@/repositories/events";
import { usersRepository } from "@/repositories/users";
import { Elysia, t } from "elysia";

const events = new Elysia()
  .state("user", {})
  .state("event", {})
  .group(
    "/events/:id",
    {
      query: t.Object({
        token: t.String({ minLength: 40, maxLength: 40 }),
        email: t.String({ format: "email" }),
      }),
      // Authenticate user and retrieve event informations
      beforeHandle: async ({
        params: { id: eventId },
        query: { email, token },
        set,
        store,
      }) => {
        // Verify the user token
        if (!usersRepository.verifyToken(token, { eventId, email })) {
          set.status = 403;
          return { error: "Invalid token" };
        }
        // Retrieve user and event informations
        const user = await usersRepository.getUser(eventId, email);
        const event = await eventsRepository.getEvent(eventId);
        if (!user || !event) {
          set.status = 404;
          return { error: "Unknown event" };
        }
        // Add data to request store
        Object.assign(store, { user, event });
      },
    },
    (app) =>
      app
        // POST : Confirm event registration
        .post("/", ({ store }) => {
          store.user;
        })
        // DELETE : Cancel event registration
        .delete("/", () => {}, { body: t.Object({ reason: t.String() }) })
        // GET : Retrieve member and event info
        .get("/", () => {})
  );

export { events };
