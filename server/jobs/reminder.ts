// Job : Send email to registered users to remind them of the event
// When to trigger : From 1 month before the event, every week until the event

import { sendEmail } from "@/services/email";
import type { JobPayload } from "@/shared/jobs";
import { getDaysDiff } from "@/shared/utils";
import type { Event, UserRegistration } from "@prisma/client";

// The number of days before the event to send the email
// 1 month = 4 weeks before the event
const daysBefore = 4 * 7;

// Wether the job should run for a registered user or not
const check = (registration: UserRegistration, event: Event) => {
  if (!registration.confirmed) return false;
  // Check if they are a multiple of 7 days before the event between 1 week and 4 weeks (included)
  const daysBeforeEvent = getDaysDiff(event.date);
  if (daysBeforeEvent > 4 * 7) return false;
  if (daysBeforeEvent % 7 === 0) return true;
  // If the event is tomorrow or today, we should send the reminder
  if (daysBeforeEvent === 1 || daysBeforeEvent === 0) return true;
  return false;
};

// Run the job
async function run({ event, registration }: JobPayload) {
  console.log("🦊 Running reminder job for event", event);
  // Calculate the number of days before the event
  const daysBeforeEvent = getDaysDiff(event.date);
  await sendEmail("event-reminder", {
    event,
    registration,
    includeLink: true,
    additionalData: {
      relativeTime: calculateRelativeTime(daysBeforeEvent),
      daysBeforeEvent,
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

export default { daysBefore, check, run };
