// Job : Send email to registered users to confirm their attendance

import {
  shouldRunJobByDays,
  type JobPayload,
  checkForCriteria,
} from "@/shared/jobs";
import { prisma } from "@/src/setup";

// The number of days before the event to send the email
// 8 weeks before the event up to 5 weeks before the event
const timer = shouldRunJobByDays([8 * 7, 7 * 7, 6 * 7, 5 * 7], {
  useRegistrationDate: true,
});

// Wether the job should run for a registered user or not
const check = checkForCriteria({
  waitListed: false,
  confirmed: false,
});

// Run the job
// Time to confirm : 1 month before the event
async function run({ event, registration }: JobPayload) {
  console.log("🦊 Running confirmation job for user #", registration.userId);
  await prisma.userRegistration.sendConfirmationEmail(registration, event);
}

export default { timer, check, run };
