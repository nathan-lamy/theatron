import { prisma } from "@/src/setup";
import { email } from "../shared/validator";
import { UserRegistration } from "@prisma/client";
import { Elysia, t } from "elysia";
import { auth } from "@/services/auth";

export const events = new Elysia()
  .state("registration", {} as UserRegistration)
  .group(
    "/events/:id",
    {
      query: t.Object({
        token: t.String({ minLength: 40, maxLength: 40 }),
        email,
      }),
      // MIDDLEWARE : Authenticate user and retrieve event informations
      beforeHandle: async ({
        params: { id: eventId },
        query: { email, token },
        set,
        store,
      }) => {
        // Verify the user token
        if (!auth.verifyToken(token, { eventId, email })) {
          set.status = 403;
          return { error: "INVALID_TOKEN" };
        }
        // Retrieve user registration and event informations
        const parsedEventId = parseInt(eventId);
        const registration = await prisma.user.getRegistration(
          parsedEventId,
          email
        );
        if (!registration) {
          set.status = 404;
          return { error: "UNKNOWN_REGISTRATION" };
        }
        if (registration.cancelled) {
          set.status = 401;
          return { error: "CANCELLED_REGISTRATION" };
        }
        // Add data to request store
        store.registration = registration;
      },
    },
    (app) =>
      app
        // POST : Confirm event registration
        .post("/", async ({ store: { registration }, set }) => {
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
          async ({ store: { registration } }) => {
            // Update user's registration status
            await prisma.userRegistration.cancel(registration);
            return { success: true };
          },
          {
            body: t.Object({ reason: t.String() }),
          }
        )
        // GET : Retrieve member and event info
        .get("/", async ({ store: { registration } }) => {
          const user = await prisma.user.getById(registration.userId);
          const event = await prisma.event.getById(registration.eventId);
          return {
            user: prisma.user.serialize(user!),
            registration: prisma.userRegistration.serialize(registration),
            event: prisma.event.serialize(event!),
            success: true,
          };
        })
  )
  .get("/events", async () => {
    const events = await prisma.event.getAll();
    return {
      events: events.map(prisma.event.serialize),
      success: true,
    };
  });
