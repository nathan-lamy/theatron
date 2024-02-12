import type { Event, UserRegistration } from "@prisma/client";
import { getDaysDiff } from "./utils";

export interface JobPayload {
  event: Event;
  registration: UserRegistration;
}

/**
 * Returns a function that determines if a job should run based on the number of days before the event date.
 * @param daysBefore The number or array of numbers representing the threshold of days before the event.
 * @returns A function that takes an event object and returns either an array of days or false.
 */
export function shouldRunJobByDays(daysBefore: number | number[]) {
  return (event: Event) => {
    // Calculate the difference in days between the event date and the current date
    const days = getDaysDiff(event.date);

    // If daysBefore is an array, check if the event is within any of the specified days before
    if (Array.isArray(daysBefore)) {
      const daysBeforeToRun: number[] = [];
      for (const day of daysBefore) {
        if (days <= day) {
          daysBeforeToRun.push(day);
        }
      }
      return daysBeforeToRun;
    }

    // If daysBefore is a single number, check if the event is within the specified days before
    if (days <= daysBefore) {
      return daysBefore;
    }

    // If the event is not within any specified days before, return false
    return false;
  };
}
