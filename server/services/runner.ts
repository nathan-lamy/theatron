import confirmation from "@/jobs/confirmation";
import reminder from "@/jobs/reminder";
import waitList from "@/jobs/wait-list";
import { eventsRepository } from "@/repositories/events";
import { prisma } from "@/src/setup";

const jobs = [confirmation, waitList, reminder];

export default async function runner() {
  // Retrieve all closed events
  const events = await eventsRepository.getAll({ includesRegistrations: true });
  for (const event of events.filter((event) => event.date >= new Date())) {
    // Loop through all the jobs (filter the ones that already ran)
    // and check if they should run
    for (const job of jobs) {
      // Loop through all the registrations and check if the job should run
      for (const registration of event.registrations.filter(
        (registration) => !registration.cancelled
      )) {
        const occurrences = job.timer(event, registration);
        const passedCheck = occurrences && job.check(registration);
        if (occurrences && passedCheck) {
          // Close the event if it's not already closed
          if (!event.closed) {
            console.log(
              `🦊 Closing event ${event.name} before running job ${job.name}`
            );
            await eventsRepository.close(event);
            event.closed = true;
          }
          // Check if the job already ran for the user
          const jobQuery = {
            eventId: event.id,
            userId: registration.userId,
            occurrences,
            type: job.name,
          };
          const hasAlreadyRun = await prisma.job.findFirst({
            where: jobQuery,
          });
          if (!hasAlreadyRun) {
            // Run the job
            const payload = {
              event,
              registration,
              days: occurrences,
            };
            const result = await job.run(payload);
            await prisma.job.create({
              data: {
                ...jobQuery,
                // If result is a JSON object, stringify it
                result:
                  typeof result === "object" ? JSON.stringify(result) : result,
              },
            });
          } else {
            console.log(
              `🦊 Job ${job.name} already ran for user #${registration.userId}, skipping...`
            );
          }
        }
      }
    }
  }
}
