import { AppType } from "@server/index";
import { hc } from "hono/client";

export const client = hc<AppType>(import.meta.env.VITE_API_URL);
