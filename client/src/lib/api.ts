import { AppType } from "@server/index";
import { hc } from "hono/client";

export const client = hc<AppType>("http://localhost:3000/");
