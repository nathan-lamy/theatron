// Job : Send email to registered users to remind them of the event

import { sendEmail } from "@/services/email";
import {
  shouldRunJobByDays,
  type JobPayload,
  checkForCriteria,
} from "@/shared/jobs";

// The number of days before the event to send the email
// 1 month = 4 weeks before the event
const timer = shouldRunJobByDays([4 * 7, 3 * 7, 2 * 7, 7, 1, 0]);

// Wether the job should run for a registered user or not
const check = checkForCriteria({
  confirmed: true,
  waitListed: false,
});

// Run the job
async function run({ event, registration, days }: JobPayload) {
  console.log("🦊 Running reminder job for event", event);
  // Calculate the number of days before the event
  return sendEmail("event-reminder", {
    event,
    registration,
    includeLink: true,
    additionalData: {
      relativeTime: calculateRelativeTime(days),
      daysBeforeEvent: days,
    },
  });
}

function calculateRelativeTime(daysBeforeEvent: number) {
  // Wether "dans un mois", "dans trois semaines", "dans deux semaines", "dans une semaine", "cette semaine", "demain", "aujourd'hui"
  if (daysBeforeEvent === 7 * 4) return "dans un mois";
  if (daysBeforeEvent === 7 * 3) return "dans trois semaines";
  if (daysBeforeEvent === 7 * 2) return "dans deux semaines";
  if (daysBeforeEvent === 7) return "dans une semaine";
  if (daysBeforeEvent === 1) return "demain";
  return "aujourd'hui";
}

export default { timer, check, run };
