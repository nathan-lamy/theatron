import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { boot } from "../services/cron";
import { boot as bootMailTransporter } from "../services/mail";
import { generateJWT, verifyShortLink } from "../utils/link";

const app = new Hono();

app.use("*", cors());

// TODO: Cron job every day at 6:00 AM (change time in env variables)
bootMailTransporter();
boot();

const route = app
  .post(
    "/events/:id",
    zValidator("json", z.object({ token: z.string() })),
    ({ req, json }) => {
      // TODO: Validate token & logic
      console.log(req.json());
      return json({ id: req.param("id") });
    }
  )
  .delete(
    "/events/:id",
    zValidator("json", z.object({ token: z.string(), reason: z.string() })),
    ({ req, json }) => {
      // TODO: Validate token & logic
      console.log(req.json());
      return json({ id: req.param("id") });
    }
  )
  .post(
    "/auth/:id",
    zValidator(
      "query",
      z.object({
        token: z.string().min(40).max(40),
        email: z.string().email(),
        i: z.string().regex(/^\d+$/),
      })
    ),
    async ({ req, json }) => {
      const eventId = req.param("id");
      const { email, token, i } = req.query();
      if (verifyShortLink({ email, eventId, token })) {
        // TODO: Redirect to frontend with JWT
        // const cookie = generateJWT(member, event, reminder);
        return json({ eventId, i });
      }
      return json({ error: "Invalid token" }, 403);
    }
  );

export type AppType = typeof route;

export default app;
