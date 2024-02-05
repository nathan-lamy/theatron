// Job : Send email to users who didn't confirm their attendance
// When to trigger : 1 month before the event

import { sendEmail } from "@/services/email";
import type { JobPayload } from "@/shared/jobs";
import { prisma } from "@/src/setup";
import type { UserRegistration } from "@prisma/client";

// The number of days before the event to send the email
// 1 month = 4 weeks before the event
const daysBefore = 4 * 7;

// Wether the job should run for a registered user or not
const check = (registration: UserRegistration) =>
  !registration.confirmed &&
  registration.confirmBefore &&
  registration.confirmBefore <= new Date();

// Run the job
async function run({ event, registration }: JobPayload) {
  console.log("🦊 Running expiry job for event", event);
  await prisma.userRegistration.cancel(registration);
  await sendEmail("confirmation-expired", {
    event,
    registration,
  });
}

export default { daysBefore, check, run };
