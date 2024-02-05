import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
// NOTE: Relative import used for type resolution (frontend/backend compatibility)
import { events } from "../controllers/events";

export const app = new Elysia().use(cors()).use(events);
export type App = typeof app;
