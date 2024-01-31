import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { events } from "@/controllers/events";

const app = new Elysia().use(cors()).use(events);

export default app;
