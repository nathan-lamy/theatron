import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { boot } from "../services/cron";

const app = new Hono();

app.use("*", cors());

// TODO: Cron job every day at 6:00 AM (change time in env variables)
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
  );

export type AppType = typeof route;

export default app;
