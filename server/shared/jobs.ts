import type { Event, UserRegistration } from "@prisma/client";

export interface JobPayload {
  event: Event;
  registration: UserRegistration;
  days: number;
}

/**
 * Returns a function that determines if a job should run based on the number of days before the event date.
 * If daysBefore is an array, it returns the minimum number of days before the event date that satisfies the condition.
 */
export function shouldRunJobByDays(daysBefore: number | number[]) {
  return (event: Event) => {
    // Calculate the difference in days between the event date and the current date
    const days = getDaysDiff(event.date);

    // If daysBefore is an array, find the minimum number of days before the event
    if (Array.isArray(daysBefore)) {
      let minDaysBefore: number | undefined;
      for (const day of daysBefore) {
        if (
          days <= day &&
          (minDaysBefore === undefined || day < minDaysBefore)
        ) {
          minDaysBefore = day;
        }
      }
      return minDaysBefore !== undefined ? minDaysBefore : false;
    }

    // If daysBefore is a single number, check if the event is within the specified days before
    if (days <= daysBefore) {
      return daysBefore;
    }

    // If the event is not within any specified days before, return false
    return false;
  };
}

/**
 * Returns a function that determines if a job should run based on the registration object.
 */
export const checkForCriteria =
  (criteria: Partial<Record<keyof UserRegistration, unknown>>) =>
  (registration: UserRegistration) =>
    Object.entries(criteria).every(
      // If function, call it with the value, otherwise compare the value
      ([key, value]) =>
        typeof value === "function"
          ? // @ts-expect-error - We know the value is a function
            value(registration[key])
          : // @ts-expect-error - We know the value is a key of UserRegistration
            registration[key] === value
    );

/**
 * Get the difference in days between two dates
 */
const getDaysDiff = (date1: Date, date2: Date = new Date()) =>
  Math.abs(
    Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))
  );
