// Job : Send email to the organizer to send him the list of participants

import { sendAttendanceSheet } from "@/services/email";
import { shouldRunJobByDays, type JobPayload } from "@/shared/jobs";

// The number of days before the event to send the email
// Send the sheet a week before the event
const timer = shouldRunJobByDays([7, 1]);

// Run the job
// Time to confirm : 1 month before the event
async function run({ event }: JobPayload) {
  console.log("🦊 Running attendance job for event #", event.id);
  return sendAttendanceSheet(event);
}

export default { timer, run, name: "attendance" };
