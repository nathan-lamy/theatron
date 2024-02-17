import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
// NOTE: Relative import used for type resolution (frontend/backend compatibility)
import { events } from "../controllers/events";
import { register } from "../controllers/register";

export const app = new Elysia()
  .use(cors({ methods: "*" }))
  .use(events)
  .use(register);
export type App = typeof app;

import { Event as PrismaEvent } from "@prisma/client";
export type Event = PrismaEvent;
