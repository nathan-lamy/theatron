// Job : Inform users that they are on the wait list
// When to trigger : 2 months (or less if the event is sooner) before the event

import { sendEmail } from "@/services/email";
import type { JobPayload } from "@/shared/jobs";
import { UserRegistration } from "@prisma/client";

// The number of days before the event to send the email
// 2 months = 8 weeks (or less if the event is sooner)
const daysBefore = 8 * 7;

// Wether the job should run for a registered user or not
const check = (registration: UserRegistration) => registration.waitListed;

// Run the job
async function run({ event, registration }: JobPayload) {
  console.log("🦊 Running wait-list job for event", event);
  await sendEmail("on-wait-list", {
    event,
    registration,
    includeLink: true,
  });
}

export default { daysBefore, check, run };
