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
  c.req.data = { member, event };
  await next();
}
