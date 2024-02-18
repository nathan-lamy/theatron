// Job : Inform users that they are on the wait list

import { sendEmail } from "@/services/email";
import {
  shouldRunJobByDays,
  type JobPayload,
  checkForCriteria,
} from "@/shared/jobs";
import { prisma } from "@/src/setup";

// The number of days before the event to send the email
// 2 months = 8 weeks (or less if the event is sooner)
const timer = shouldRunJobByDays(8 * 7);

// Wether the job should run for a registered user or not
const check = checkForCriteria({
  waitListed: true,
});

// Run the job
async function run({ event, registration }: JobPayload) {
  console.log("🦊 Running wait-list job for event", event);
  // Find user's position on wait list
  const registrations = await prisma.event.getWaitList(event.id);
  const position =
    registrations.findIndex((reg) => reg.id === registration.id) + 1;
  return sendEmail("on-wait-list", {
    event,
    registration,
    includeLink: true,
    additionalData: {
      position,
    },
  });
}

export default { timer, check, run, name: "wait-list" };
