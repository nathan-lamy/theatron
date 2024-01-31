import { Cron } from "croner";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { boot } from "../services/cron";
import {
  CRON_HOUR,
  boot as bootMail,
  sendWaitListAlert,
} from "../services/mail";
import {
  boot as bootGoogleSheetsApi,
  EventInfo,
  Member,
  deleteRow,
  getSheetId,
  updateCellValue,
} from "../services/sheets";
import { sortWaitList } from "../services/queue";
import {
  calculateConfirmBeforeFromEventDate,
  convertDateStringToDate,
} from "../utils/date";
import { auth, validateRequest } from "../middlewares/auth";

// Start services
let job: Cron;
(async () => {
  await bootGoogleSheetsApi();
  await bootMail();

  job = Cron(`0 ${CRON_HOUR} * * *`, { timezone: "Europe/Paris" }, () =>
    boot()
      .catch(console.error)
      .then(() => console.log("[CRON] Job terminated successfully"))
  );
})();

// Start app
const app = new Hono();
app.use("*", cors());

const route = app
  // POST - Confirm event registration (update cell in sheets)
  .post("/events/:id", validateRequest, auth, async ({ req, json }) => {
    const { member, event } = req.data;
    if (member.hasConfirmed) return json({ success: true });
    if (member.onWaitList) return json({ error: "On wait list" }, 401);
    // Update cell in sheets
    await updateCellValue(event.id, `F${member.uid}`, "TRUE").catch((err) => {
      console.error(err);
      return json({ error: "Failed to update cell" }, 500);
    });
    return json({ success: true });
  })
  // DELETE event registration (remove row in sheets)
  .delete(
    "/events/:id",
    validateRequest,
    auth,
    zValidator("json", z.object({ reason: z.string() })),
    async ({ req, json }) => {
      const { member, members, event } = req.data;
      // Retrieve sheet id from event id
      const sheetId = await getSheetId(event.id);
      // @ts-expect-error Number is not NaN
      if (Number.isNaN(+sheetId))
        return json({ error: "Failed to retrieve sheet id" }, 500);
      // Get first member on wait list
      const [firstMemberOnWaitList] = sortWaitList(
        members.filter((m) => m.onWaitList)
      );
      if (firstMemberOnWaitList)
        // Remove it from wait list
        await updateCellValue(
          event.id,
          `E${firstMemberOnWaitList.uid}`,
          "FALSE"
        ).catch((err) => {
          console.error(err);
          return json({ error: "Failed to update cell" }, 500);
        });
      // Remove row in sheets
      console.log(`[DELETE] Removing row ${member.uid} in sheet ${sheetId}`);
      await deleteRow(sheetId!, member.uid).catch((err) => {
        console.error(err);
        return json({ error: "Failed to delete row" }, 500);
      });
      // TODO: Send email to admin
      // Send wait list alert to first member on wait list
      if (firstMemberOnWaitList)
        await sendWaitListAlert(firstMemberOnWaitList, event);
      return json({ success: true });
    }
  )
  // Get event info (member & event)
  .get(
    "/events/:id",
    validateRequest,
    auth,
    // TODO: Cache response & rate limit (slow because of sheets API)
    async ({ req, json }) => {
      const { member, event } = req.data;
      // Generate response payload
      const payload = {
        user: { ...member, name: `${member.firstName} ${member.lastName}` },
        event,
      } as EventPayload;
      payload.confirmBeforeDate = calculateConfirmBeforeFromEventDate(
        convertDateStringToDate(event.date)
      );
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
  confirmBeforeDate: string;
}

export default app;
