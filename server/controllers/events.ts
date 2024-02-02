import { eventsRepository } from "@/repositories/events";
import { usersRepository } from "@/repositories/users";
import { prisma } from "@/src/setup";
import { Event, UserRegistration } from "@prisma/client";
import { Elysia, t } from "elysia";

const events = new Elysia()
  .state("registration", {} as UserRegistration)
  .state("event", {} as Event)
  .group(
    "/events/:id",
    {
      query: t.Object({
        token: t.String({ minLength: 40, maxLength: 40 }),
        email: t.String({ format: "email", default: "saly.adrien@ac-nice.fr" }),
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
        // Retrieve user registration and event informations
        const registration = await usersRepository.getUserRegistration(
          email,
          eventId
        );
        const event = await eventsRepository.getEvent(eventId);
        if (!registration || !event) {
          set.status = 404;
          return { error: "Unknown event" };
        }
        // Add data to request store
        Object.assign(store, { registration, event });
      },
    },
    (app) =>
      app
        // POST : Confirm event registration
        .post("/", async ({ store: { registration, event }, set }) => {
          // Check if user registration is already confirmed or is on wait list
          if (registration.confirmed) return { success: true };
          if (registration.waitListed) {
            set.status = 401;
            return { error: "ON_WAIT_LIST" };
          }

          // Update user's registration status
          await prisma.userRegistration.confirm(registration);
          return { success: true };
        })
        // DELETE : Cancel event registration
        .delete(
          "/",
          async ({ store: { registration, event } }) => {
            // Update user's registration status
            await prisma.userRegistration.cancel(registration);

            // Allow first member on wait list to register (if the user was not on wait list)
            if (!registration.waitListed) {
              const [firstOnWaitList] = await prisma.event.getWaitList(
                registration.eventId
              );
              if (firstOnWaitList) {
                await prisma.userRegistration.cancelWaitList(registration);
                await prisma.userRegistration.sendConfirmationEmail(
                  firstOnWaitList
                );
              }
            }

            return { success: true };
          },
          {
            body: t.Object({ reason: t.String() }),
          }
        )
        // GET : Retrieve member and event info
        .get("/", ({ store: { registration, event } }) => {
          // TODO: Load user
          return {
            // user: user.serialize(),
            registration: prisma.userRegistration.serialize(registration),
            event: prisma.event.serialize(event),
          };
        })
  );

export { events };
