import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { boot } from "../services/cron";
import { boot as bootMailTransporter } from "../services/mail";
import {
  EventInfo,
  Member,
  deleteRow,
  getSheetId,
  updateCellValue,
} from "../services/sheets";
import { calculateConfirmBeforeDate } from "../utils/date";
import { auth, validateRequest } from "../middlewares/auth";

const app = new Hono();

app.use("*", cors());

// TODO: Cron job every day at 6:00 AM (change time in env variables)
bootMailTransporter();
boot();

const route = app
  // Confirm event registration (update cell in sheets)
  .post("/events/:id", validateRequest, auth, async ({ req, json }) => {
    const { member, event } = req.data;
    if (member.hasConfirmed) return json({ success: true });
    if (member.onWaitList) return json({ error: "On wait list" }, 403);
    // Update cell in sheets
    await updateCellValue(event.id, `F${member.uid}`, "TRUE").catch((err) => {
      console.error(err);
      return json({ error: "Failed to update cell" }, 500);
    });
    // TODO: Send confirmation email
    return json({ success: true });
  })
  // Delete event registration (remove row in sheets)
  .delete(
    "/events/:id",
    validateRequest,
    auth,
    zValidator("json", z.object({ reason: z.string() })),
    async ({ req, json }) => {
      const { member, event } = req.data;
      // Retrieve sheet id from event id
      const sheetId = await getSheetId(event.id);
      // @ts-expect-error Number is not NaN
      if (Number.isNaN(+sheetId))
        return json({ error: "Failed to retrieve sheet id" }, 500);
      // Remove row in sheets
      console.log(`[DELETE] Removing row ${member.uid} in sheet ${sheetId}`);
      await deleteRow(sheetId!, member.uid).catch((err) => {
        console.error(err);
        return json({ error: "Failed to delete row" }, 500);
      });
      // TODO: Send email to admin
      // TODO: Wait list the next member
      return json({ success: true });
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
      const { i } = req.query();
      const { member, event } = req.data;
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
