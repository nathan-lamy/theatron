import confirmation from "@/jobs/confirmation";
import reminder from "@/jobs/reminder";
import waitList from "@/jobs/wait-list";
import { eventsRepository } from "@/repositories/events";
import { getDaysDiff } from "@/shared/utils";

const jobs = [confirmation, waitList, reminder];

export default async function runner() {
  // Retrieve all closed events
  const events = await eventsRepository.getAll({ includesRegistrations: true });
  for (const event of events.filter((event) => event.date >= new Date())) {
    // Calculate number of days before the event
    const daysBefore = getDaysDiff(event.date);
    // Loop through all the jobs (filter the ones that already ran)
    // and check if they should run
    for (const job of jobs) {
      if (daysBefore <= job.daysBefore) {
        // Loop through all the registrations and check if the job should run
        for (const registration of event.registrations.filter(
          (registration) => !registration.cancelled
        )) {
          if (job.check(registration, event)) {
            // Run the job
            const payload = {
              event,
              registration,
            };
            job.run(payload);
            // TODO: Handle the job result (and errors)
          }
        }
      }
    }
  }
}
