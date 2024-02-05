import type { Event, UserRegistration } from "@prisma/client";

export interface JobPayload {
  event: Event;
  registration: UserRegistration;
}
