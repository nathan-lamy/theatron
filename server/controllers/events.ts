import { Event } from "@/models/event";
import { User } from "@/models/user";
import { eventsRepository } from "@/repositories/events";
import { usersRepository } from "@/repositories/users";
import { Elysia, t } from "elysia";

const events = new Elysia()
  .state("user", {} as User)
  .state("event", {} as Event)
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
        .post("/", async ({ store: { user, event }, set }) => {
          // Check if user has already confirmed registration or is on wait list
          if (user.hasConfirmedRegistration(event)) return { success: true };
          if (user.isOnWaitList(event)) {
            set.status = 401;
            return { error: "ON_WAIT_LIST" };
          }

          // Update user's registration status
          await user.confirmRegistration(event);
          return { success: true };
        })
        // DELETE : Cancel event registration
        .delete(
          "/",
          async ({ store: { user, event } }) => {
            // Update user's registration status
            await user.cancelRegistration(event);

            // Allow first member on wait list to register (if the user was not on wait list)
            if (!user.isOnWaitList(event)) {
              const [firstOnWaitList] = await event.getWaitList();
              if (firstOnWaitList) {
                await event.removeMemberFromWaitList(firstOnWaitList);
                await firstOnWaitList.sendConfirmationEmail(event);
              }
            }

            return { success: true };
          },
          {
            body: t.Object({ reason: t.String() }),
          }
        )
        // GET : Retrieve member and event info
        .get("/", ({ store: { user, event } }) => {
          return {
            user: user.serialize(),
            event: event.serialize(),
          };
        })
  );

export { events };
