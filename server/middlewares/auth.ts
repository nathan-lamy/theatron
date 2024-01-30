import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { verifyShortLink } from "../utils/link";
import { getEventAndMemberInfo } from "../services/sheets";
import type { Context, Next } from "hono";

export const validateRequest = zValidator(
  "query",
  z.object({
    token: z.string().min(40).max(40),
    email: z.string().email(),
  })
);

/**
 * Middleware to validate the request and retrieve the member and event info
 */
export async function auth(c: Context, next: Next) {
  const eventId = c.req.param("id");
  const { email, token } = c.req.query();
  if (!verifyShortLink({ email, eventId, token })) {
    return c.json({ error: "Invalid token" }, 403);
  }
  // Retrieve event and member info from sheets
  const { member, event } = await getEventAndMemberInfo({
    email,
    eventId,
  });
  if (!member || !event) return c.json({ error: "Unknown event" }, 404);
  if (member.onWaitList) return c.json({ error: "On wait list" }, 401);
  // Add data to request
  c.req.data = { member, event };
  await next();
}
