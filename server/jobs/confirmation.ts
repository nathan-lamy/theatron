// Job : Send email to registered users to confirm their attendance
// When to trigger : 2 months (or less if the event is sooner) before the event
// Time to confirm : 1 month before the event

import { usersRepository } from "@/repositories/users";
import { sendEmail } from "@/services/email";
import type { JobPayload } from "@/shared/jobs";
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
    const today = new Date();
    const diff = registration.confirmBefore.getTime() - today.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    // The days difference must be equal to a round number of weeks
    if (days % 7 !== 0) return false;
    // Take the absolute value of the days difference
    const weeks = Math.abs(days) / 7;
    return weeks >= 1 && weeks <= 4;
  }
  return true;
};

// Run the job
async function run({ event, registration }: JobPayload) {
  console.log("🦊 Running confirmation job for user #", registration.userId);

  if (!registration.confirmBefore) {
    // Set the confirm before date to 4 weeks before the event
    const confirmBefore = new Date(event.date);
    confirmBefore.setDate(confirmBefore.getDate() - 4 * 7);
    // Save the confirm before date
    await usersRepository.setConfirmBeforeDate(registration, confirmBefore);
    registration.confirmBefore = confirmBefore;
  }

  // Send the confirmation email
  await sendEmail("confirm-registration", {
    event,
    registration,
    includeLink: true,
  });
  console.log("🦊 Confirmation email sent to user #", registration.userId);
}

export default { daysBefore, check, run };
