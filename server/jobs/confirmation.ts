// Job : Send email to registered users to confirm their attendance
// When to trigger : 2 months (or less if the event is sooner) before the event
// Time to confirm : 1 month before the event

import type { JobPayload } from "@/shared/jobs";
import { getDaysDiff } from "@/shared/utils";
import { prisma } from "@/src/setup";
import type { UserRegistration } from "@prisma/client";

// The number of days before the event to send the email
// 2 months = 8 weeks (or less if the event is sooner) before the event
const daysBefore = 8 * 7;

// Wether the job should run for a registered user or not
const check = (registration: UserRegistration) => {
  // The registration must not be on the wait list
  if (registration.waitListed) return false;
  // The registration must not be already confirmed
  if (registration.confirmed) return false;
  // Wether the registration hasn't any confirm before date yet
  // Or the day difference is a round number of weeks between 1 and 4
  if (registration.confirmBefore && registration.confirmBefore <= new Date()) {
    const days = getDaysDiff(registration.confirmBefore);
    // The days difference must be equal to a round number of weeks
    if (days % 7 !== 0) return false;
    const weeks = days / 7;
    return weeks >= 1 && weeks <= 4;
  }
  return true;
};

// Run the job
async function run({ event, registration }: JobPayload) {
  console.log("🦊 Running confirmation job for user #", registration.userId);
  await prisma.userRegistration.sendConfirmationEmail(registration);
}

export default { daysBefore, check, run };
