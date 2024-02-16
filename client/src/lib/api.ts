import { edenTreaty } from "@elysiajs/eden";
import type { App, Event } from "@server/app";

export const client = edenTreaty<App>(import.meta.env.VITE_API_URL!);
export { Event };
