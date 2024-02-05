// Job : Send email to registered users to remind them of the event
// When to trigger : From 1 month before the event, every week until the event

import { isConfirmed, type JobPayload } from "@/shared/jobs";

// The number of days before the event to send the email
// 1 month = 4 weeks before the event
const daysBefore = 4 * 7;

// Wether the job should run for a registered user or not
const check = isConfirmed;

// Run the job
async function run({ event, registration }: JobPayload) {
  console.log("🦊 Running reminder job for event", event);
}

export default { daysBefore, check, run };
