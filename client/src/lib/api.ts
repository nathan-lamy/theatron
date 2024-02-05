import { edenTreaty } from "@elysiajs/eden";
import type { App } from "@server/app";

export const client = edenTreaty<App>(import.meta.env.VITE_API_URL!);
