// Job : Send email to users who didn't confirm their attendance

import { sendEmail } from "@/services/email";
import {
  checkForCriteria,
  shouldRunJobByDays,
  type JobPayload,
} from "@/shared/jobs";
import { prisma } from "@/src/setup";

// The number of days before the event to send the email
// 1 month = 4 weeks before the event
// TODO: Run if confirmBefore >= Date.now()
const timer = shouldRunJobByDays([4 * 7]);

// Wether the job should run for a registered user or not
const check = checkForCriteria({
  confirmed: false,
  confirmBefore: (date: Date) => date && date <= new Date(),
  waitListed: false,
});

// Run the job
async function run({ event, registration }: JobPayload) {
  console.log("🦊 Running expiry job for event", event);
  await prisma.userRegistration.cancel(registration);
  // Shadow ban the user from all future events
  await prisma.userRegistration.updateMany({
    where: {
      userId: registration.userId,
    },
    data: {
      priority: 99,
    },
  });
  return sendEmail("confirmation-expired", {
    event,
    registration,
  });
}

export default { timer, check, run, name: "expiry" };
