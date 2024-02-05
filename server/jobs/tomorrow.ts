// Job : Send email to registered users one day before the event
// When to trigger : 1 day before the event

import { isConfirmed, type JobPayload } from "@/shared/jobs";

// The number of days before the event to send the email
// 1 day before the event
const daysBefore = 1;

// Wether the job should run for a registered user or not
const check = isConfirmed;

// Run the job
async function run({ event, registration }: JobPayload) {
  console.log("🦊 Running tomorrow job for event", event);
}

export default { daysBefore, check, run };
