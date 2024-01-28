import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { boot } from "../services/cron";
import { boot as bootMailTransporter } from "../services/mail";
import { EventInfo, Member, getEventAndMemberInfo } from "../services/sheets";
import { calculateConfirmBeforeDate } from "../utils/date";
import { auth, validateRequest } from "../middlewares/auth";

const app = new Hono();

app.use("*", cors());

// TODO: Cron job every day at 6:00 AM (change time in env variables)
bootMailTransporter();
boot();

const route = app
  // Confirm event registration (update cell in sheets)
  .post("/events/:id", validateRequest, auth, ({ req, json }) => {
    // TODO: Validate token & logic
    console.log(req.json());
    return json({ id: req.param("id") });
  })
  // Delete event registration (remove row in sheets)
  .delete(
    "/events/:id",
    validateRequest,
    auth,
    zValidator("json", z.object({ reason: z.string() })),
    ({ req, json }) => {
      // TODO: Validate token & logic
      console.log(req.json());
      return json({ id: req.param("id") });
    }
  )
  // Get event info (member & event)
  .get(
    "/events/:id",
    validateRequest,
    auth,
    zValidator(
      "query",
      z.object({
        i: z.string().regex(/^\d+$/).optional(),
      })
    ),
    // TODO: Cache response & rate limit (slow because of sheets API)
    async ({ req, json }) => {
      const eventId = req.param("id");
      console.log("INCOMING REQUEST FOR EVENT", eventId);
      const { email, i } = req.query();

      // Retrieve event and member info from sheets
      const { member, event } = await getEventAndMemberInfo({
        email,
        eventId,
      });
      if (!member || !event) return json({ error: "Invalid token" }, 403);

      // Generate response payload
      const payload = {
        user: { ...member, name: `${member.firstName} ${member.lastName}` },
        event,
      } as EventPayload;
      // TODO: Fix confirmBeforeDate
      // * La date est calculée en fonction de la date du jour, mais il faudrait la calculer en fonction de la date de l'événement
      // Ne pas modifier la fonction car elle est utilisée dans les mails
      if (i) payload.confirmBeforeDate = calculateConfirmBeforeDate(+i);
      return json(payload);
    }
  );

export type AppType = typeof route;

interface NamedMember extends Member {
  name: string;
}
export interface EventPayload {
  user: NamedMember;
  event: EventInfo;
  confirmBeforeDate?: string;
}

export default app;
