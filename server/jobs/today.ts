// Job : Send email to registered users the day of the event
// When to trigger : The day of the event

import { isConfirmed, type JobPayload } from "@/shared/jobs";

// The number of days before the event to send the email
// 0 days before the event
const daysBefore = 0;

// Wether the job should run for a registered user or not
const check = isConfirmed;

// Run the job
async function run({ event, registration }: JobPayload) {
  console.log("🦊 Running today job for event", event);
}

export default { daysBefore, check, run };
