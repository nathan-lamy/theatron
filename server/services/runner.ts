import confirmation from "@/jobs/confirmation";
import reminder from "@/jobs/reminder";
import today from "@/jobs/today";
import tomorrow from "@/jobs/tomorrow";
import waitList from "@/jobs/wait-list";
import { eventsRepository } from "@/repositories/events";

const jobs = [confirmation, waitList, reminder, tomorrow, today];

export default async function runner() {
  // Retrieve all closed events
  const events = await eventsRepository.getAll({ includesRegistrations: true });
  for (const event of events.filter((event) => event.closed)) {
    // Calculate number of days before the event
    const daysBefore = Math.floor(
      (event.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    // Loop through all the jobs (filter the ones that already ran)
    // and check if they should run
    for (const job of jobs) {
      if (daysBefore <= job.daysBefore) {
        // Loop through all the registrations and check if the job should run
        for (const registration of event.registrations.filter(
          (registration) => !registration.cancelled
        )) {
          if (job.check(registration)) {
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
